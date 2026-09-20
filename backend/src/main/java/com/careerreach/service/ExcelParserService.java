package com.careerreach.service;

import com.opencsv.CSVReader;
import com.careerreach.dto.ImportPreviewResponse;
import com.careerreach.dto.ImportSummaryDto;
import com.careerreach.dto.InvalidRowDto;
import com.careerreach.entity.Contact;
import com.careerreach.entity.ContactStatus;
import com.careerreach.entity.User;
import com.careerreach.exception.BadRequestException;
import com.careerreach.repository.ContactRepository;
import com.careerreach.util.ColumnHeaderNormalizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelParserService {

    private final ContactRepository contactRepository;

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$"
    );

    public record ParseResult(List<Contact> validContacts, ImportSummaryDto summary) {}

    public ImportPreviewResponse previewFile(MultipartFile file) {
        validateFile(file);
        String extension = getFileExtension(file.getOriginalFilename()).toLowerCase();

        return switch (extension) {
            case "csv" -> previewCsv(file);
            case "xlsx", "xls" -> previewExcel(file);
            default -> throw new BadRequestException(
                    "Unsupported file format (" + extension + "). Please upload a .xlsx, .xls, or .csv file."
            );
        };
    }

    public ParseResult parseFile(User user, MultipartFile file) {
        return parseFile(user, file, null);
    }

    public ParseResult parseFile(User user, MultipartFile file, Map<String, String> customMapping) {
        validateFile(file);
        String extension = getFileExtension(file.getOriginalFilename()).toLowerCase();

        return switch (extension) {
            case "csv" -> parseCsv(user, file, customMapping);
            case "xlsx", "xls" -> parseExcel(user, file, customMapping);
            default -> throw new BadRequestException(
                    "Unsupported file format (" + extension + "). Please upload a .xlsx, .xls, or .csv file."
            );
        };
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        if (file.getOriginalFilename() == null) {
            throw new BadRequestException("Filename is missing");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 10MB limit");
        }
    }

    private ImportPreviewResponse previewExcel(MultipartFile file) {
        List<String> headers = new ArrayList<>();
        List<Map<String, String>> previewRows = new ArrayList<>();
        int estimatedTotal = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();
            Iterator<Row> rowIterator = sheet.iterator();

            if (!rowIterator.hasNext()) {
                throw new BadRequestException("Spreadsheet contains no header or data rows");
            }

            Row headerRow = rowIterator.next();
            for (Cell cell : headerRow) {
                headers.add(formatter.formatCellValue(cell).trim());
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                if (isRowEmpty(row, formatter)) continue;
                estimatedTotal++;

                if (previewRows.size() < 10) {
                    Map<String, String> rowMap = new LinkedHashMap<>();
                    for (int i = 0; i < headers.size(); i++) {
                        String header = headers.get(i);
                        Cell cell = row.getCell(i);
                        rowMap.put(header, cell != null ? formatter.formatCellValue(cell).trim() : "");
                    }
                    previewRows.add(rowMap);
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to preview Excel file", e);
            throw new BadRequestException("Error reading Excel preview: " + e.getMessage());
        }

        Map<String, String> suggestedMapping = computeSuggestedMapping(headers);
        return ImportPreviewResponse.builder()
                .headers(headers)
                .suggestedMapping(suggestedMapping)
                .previewRows(previewRows)
                .totalEstimatedRows(estimatedTotal)
                .build();
    }

    private ImportPreviewResponse previewCsv(MultipartFile file) {
        List<String> headers = new ArrayList<>();
        List<Map<String, String>> previewRows = new ArrayList<>();
        int estimatedTotal = 0;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] headerRow = reader.readNext();
            if (headerRow == null || headerRow.length == 0) {
                throw new BadRequestException("CSV file contains no header or data rows");
            }

            for (String h : headerRow) {
                headers.add(h.trim());
            }

            String[] row;
            while ((row = reader.readNext()) != null) {
                if (isCsvRowEmpty(row)) continue;
                estimatedTotal++;

                if (previewRows.size() < 10) {
                    Map<String, String> rowMap = new LinkedHashMap<>();
                    for (int i = 0; i < headers.size(); i++) {
                        String header = headers.get(i);
                        rowMap.put(header, i < row.length ? row[i].trim() : "");
                    }
                    previewRows.add(rowMap);
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to preview CSV file", e);
            throw new BadRequestException("Error reading CSV preview: " + e.getMessage());
        }

        Map<String, String> suggestedMapping = computeSuggestedMapping(headers);
        return ImportPreviewResponse.builder()
                .headers(headers)
                .suggestedMapping(suggestedMapping)
                .previewRows(previewRows)
                .totalEstimatedRows(estimatedTotal)
                .build();
    }

    private ParseResult parseExcel(User user, MultipartFile file, Map<String, String> customMapping) {
        List<Contact> validContacts = new ArrayList<>();
        List<InvalidRowDto> invalidRows = new ArrayList<>();
        Set<String> seenEmailsInFile = new HashSet<>();
        int totalRows = 0;
        int duplicateCount = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            Iterator<Row> rowIterator = sheet.iterator();
            if (!rowIterator.hasNext()) {
                throw new BadRequestException("Spreadsheet contains no data rows");
            }

            Row headerRow = rowIterator.next();
            Map<ColumnHeaderNormalizer.CanonicalColumn, Integer> columnIndexMap = resolveExcelColumnIndices(headerRow, formatter, customMapping);

            if (!columnIndexMap.containsKey(ColumnHeaderNormalizer.CanonicalColumn.EMAIL)) {
                throw new BadRequestException("Spreadsheet must include or be mapped to an Email column");
            }

            int rowNumber = 1;
            while (rowIterator.hasNext()) {
                rowNumber++;
                Row row = rowIterator.next();
                if (isRowEmpty(row, formatter)) continue;
                totalRows++;

                String name = getCellValue(row, columnIndexMap.get(ColumnHeaderNormalizer.CanonicalColumn.NAME), formatter);
                String email = getCellValue(row, columnIndexMap.get(ColumnHeaderNormalizer.CanonicalColumn.EMAIL), formatter);
                String company = getCellValue(row, columnIndexMap.get(ColumnHeaderNormalizer.CanonicalColumn.COMPANY), formatter);
                String position = getCellValue(row, columnIndexMap.get(ColumnHeaderNormalizer.CanonicalColumn.POSITION), formatter);

                ProcessRowResult result = processRow(user, rowNumber, name, email, company, position, seenEmailsInFile);
                if (result.isDuplicate()) {
                    duplicateCount++;
                }
                if (result.isValid()) {
                    validContacts.add(result.contact());
                } else {
                    invalidRows.add(result.invalidRow());
                }
            }

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse Excel file", e);
            throw new BadRequestException("Error processing Excel file: " + e.getMessage());
        }

        ImportSummaryDto summary = ImportSummaryDto.builder()
                .totalRows(totalRows)
                .importedCount(validContacts.size())
                .validCount(validContacts.size())
                .invalidCount(invalidRows.size())
                .duplicateCount(duplicateCount)
                .invalidRows(invalidRows)
                .build();

        return new ParseResult(validContacts, summary);
    }

    private ParseResult parseCsv(User user, MultipartFile file, Map<String, String> customMapping) {
        List<Contact> validContacts = new ArrayList<>();
        List<InvalidRowDto> invalidRows = new ArrayList<>();
        Set<String> seenEmailsInFile = new HashSet<>();
        int totalRows = 0;
        int duplicateCount = 0;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] headers = reader.readNext();
            if (headers == null || headers.length == 0) {
                throw new BadRequestException("CSV file is empty or missing headers");
            }

            Map<ColumnHeaderNormalizer.CanonicalColumn, Integer> columnIndexMap = resolveCsvColumnIndices(headers, customMapping);

            if (!columnIndexMap.containsKey(ColumnHeaderNormalizer.CanonicalColumn.EMAIL)) {
                throw new BadRequestException("CSV file must include or be mapped to an Email column");
            }

            String[] row;
            int rowNumber = 1;
            while ((row = reader.readNext()) != null) {
                rowNumber++;
                if (isCsvRowEmpty(row)) continue;
                totalRows++;

                String name = getCsvCellValue(row, columnIndexMap.get(ColumnHeaderNormalizer.CanonicalColumn.NAME));
                String email = getCsvCellValue(row, columnIndexMap.get(ColumnHeaderNormalizer.CanonicalColumn.EMAIL));
                String company = getCsvCellValue(row, columnIndexMap.get(ColumnHeaderNormalizer.CanonicalColumn.COMPANY));
                String position = getCsvCellValue(row, columnIndexMap.get(ColumnHeaderNormalizer.CanonicalColumn.POSITION));

                ProcessRowResult result = processRow(user, rowNumber, name, email, company, position, seenEmailsInFile);
                if (result.isDuplicate()) {
                    duplicateCount++;
                }
                if (result.isValid()) {
                    validContacts.add(result.contact());
                } else {
                    invalidRows.add(result.invalidRow());
                }
            }

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse CSV file", e);
            throw new BadRequestException("Error processing CSV file: " + e.getMessage());
        }

        ImportSummaryDto summary = ImportSummaryDto.builder()
                .totalRows(totalRows)
                .importedCount(validContacts.size())
                .validCount(validContacts.size())
                .invalidCount(invalidRows.size())
                .duplicateCount(duplicateCount)
                .invalidRows(invalidRows)
                .build();

        return new ParseResult(validContacts, summary);
    }

    private Map<String, String> computeSuggestedMapping(List<String> headers) {
        Map<String, String> mapping = new HashMap<>();
        for (String header : headers) {
            ColumnHeaderNormalizer.CanonicalColumn canonical = ColumnHeaderNormalizer.normalize(header);
            if (canonical != ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN) {
                String key = canonical.name().toLowerCase();
                if (!mapping.containsKey(key)) {
                    mapping.put(key, header);
                }
            }
        }
        return mapping;
    }

    private Map<ColumnHeaderNormalizer.CanonicalColumn, Integer> resolveExcelColumnIndices(
            Row headerRow, DataFormatter formatter, Map<String, String> customMapping) {

        Map<ColumnHeaderNormalizer.CanonicalColumn, Integer> map = new HashMap<>();
        Map<String, Integer> headerToIdx = new HashMap<>();

        for (Cell cell : headerRow) {
            String headerText = formatter.formatCellValue(cell).trim();
            headerToIdx.put(headerText.toLowerCase(), cell.getColumnIndex());
        }

        if (customMapping != null && !customMapping.isEmpty()) {
            for (Map.Entry<String, String> entry : customMapping.entrySet()) {
                String canonicalKey = entry.getKey().trim().toUpperCase();
                String targetHeader = entry.getValue() != null ? entry.getValue().trim().toLowerCase() : "";
                if (headerToIdx.containsKey(targetHeader)) {
                    try {
                        ColumnHeaderNormalizer.CanonicalColumn col = ColumnHeaderNormalizer.CanonicalColumn.valueOf(canonicalKey);
                        map.put(col, headerToIdx.get(targetHeader));
                    } catch (IllegalArgumentException ignored) {}
                }
            }
        }

        // Fill in missing with auto-detection
        for (Cell cell : headerRow) {
            String headerText = formatter.formatCellValue(cell).trim();
            ColumnHeaderNormalizer.CanonicalColumn canonical = ColumnHeaderNormalizer.normalize(headerText);
            if (canonical != ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN && !map.containsKey(canonical)) {
                map.put(canonical, cell.getColumnIndex());
            }
        }

        return map;
    }

    private Map<ColumnHeaderNormalizer.CanonicalColumn, Integer> resolveCsvColumnIndices(
            String[] headers, Map<String, String> customMapping) {

        Map<ColumnHeaderNormalizer.CanonicalColumn, Integer> map = new HashMap<>();
        Map<String, Integer> headerToIdx = new HashMap<>();

        for (int i = 0; i < headers.length; i++) {
            headerToIdx.put(headers[i].trim().toLowerCase(), i);
        }

        if (customMapping != null && !customMapping.isEmpty()) {
            for (Map.Entry<String, String> entry : customMapping.entrySet()) {
                String canonicalKey = entry.getKey().trim().toUpperCase();
                String targetHeader = entry.getValue() != null ? entry.getValue().trim().toLowerCase() : "";
                if (headerToIdx.containsKey(targetHeader)) {
                    try {
                        ColumnHeaderNormalizer.CanonicalColumn col = ColumnHeaderNormalizer.CanonicalColumn.valueOf(canonicalKey);
                        map.put(col, headerToIdx.get(targetHeader));
                    } catch (IllegalArgumentException ignored) {}
                }
            }
        }

        // Fill in missing with auto-detection
        for (int i = 0; i < headers.length; i++) {
            ColumnHeaderNormalizer.CanonicalColumn canonical = ColumnHeaderNormalizer.normalize(headers[i].trim());
            if (canonical != ColumnHeaderNormalizer.CanonicalColumn.UNKNOWN && !map.containsKey(canonical)) {
                map.put(canonical, i);
            }
        }

        return map;
    }

    private ProcessRowResult processRow(
            User user,
            int rowNumber,
            String name,
            String email,
            String company,
            String position,
            Set<String> seenEmailsInFile) {

        if (email == null || email.isBlank()) {
            return new ProcessRowResult(false, false, null, InvalidRowDto.builder()
                    .rowNumber(rowNumber)
                    .name(name)
                    .email(email)
                    .company(company)
                    .position(position)
                    .reason("Missing email address")
                    .build());
        }

        String trimmedEmail = email.trim().toLowerCase();

        if (!EMAIL_PATTERN.matcher(trimmedEmail).matches()) {
            return new ProcessRowResult(false, false, null, InvalidRowDto.builder()
                    .rowNumber(rowNumber)
                    .name(name)
                    .email(email)
                    .company(company)
                    .position(position)
                    .reason("Invalid email format")
                    .build());
        }

        if (seenEmailsInFile.contains(trimmedEmail)) {
            return new ProcessRowResult(false, true, null, InvalidRowDto.builder()
                    .rowNumber(rowNumber)
                    .name(name)
                    .email(email)
                    .company(company)
                    .position(position)
                    .reason("Duplicate email in upload file")
                    .build());
        }

        if (contactRepository.existsByUserIdAndEmailIgnoreCase(user.getId(), trimmedEmail)) {
            return new ProcessRowResult(false, true, null, InvalidRowDto.builder()
                    .rowNumber(rowNumber)
                    .name(name)
                    .email(email)
                    .company(company)
                    .position(position)
                    .reason("Contact with this email already exists in your account")
                    .build());
        }

        seenEmailsInFile.add(trimmedEmail);

        String trimmedName = name != null ? name.trim() : "";
        String trimmedCompany = company != null ? company.trim() : "";
        String trimmedPosition = position != null ? position.trim() : "";

        Contact contact = Contact.builder()
                .user(user)
                .name(trimmedName)
                .email(trimmedEmail)
                .company(trimmedCompany)
                .position(trimmedPosition)
                .status(ContactStatus.READY)
                .build();

        return new ProcessRowResult(true, false, contact, null);
    }

    private String getCellValue(Row row, Integer columnIndex, DataFormatter formatter) {
        if (columnIndex == null || row == null) return "";
        Cell cell = row.getCell(columnIndex);
        return cell != null ? formatter.formatCellValue(cell).trim() : "";
    }

    private String getCsvCellValue(String[] row, Integer columnIndex) {
        if (columnIndex == null || row == null || columnIndex >= row.length) return "";
        return row[columnIndex] != null ? row[columnIndex].trim() : "";
    }

    private boolean isRowEmpty(Row row, DataFormatter formatter) {
        if (row == null) return true;
        for (Cell cell : row) {
            if (cell != null && !formatter.formatCellValue(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private boolean isCsvRowEmpty(String[] row) {
        if (row == null || row.length == 0) return true;
        for (String val : row) {
            if (val != null && !val.trim().isEmpty()) return false;
        }
        return true;
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == filename.length() - 1) return "";
        return filename.substring(dotIndex + 1);
    }

    private record ProcessRowResult(boolean isValid, boolean isDuplicate, Contact contact, InvalidRowDto invalidRow) {}
}
