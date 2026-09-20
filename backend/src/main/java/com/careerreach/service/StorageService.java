package com.careerreach.service;

public interface StorageService {

    /**
     * Uploads an object to storage at the specified path.
     *
     * @param path The relative storage path (e.g. "userId/resume/uuid.pdf")
     * @param data The raw file binary data
     * @param contentType The MIME type (e.g. "application/pdf")
     */
    void upload(String path, byte[] data, String contentType);

    /**
     * Downloads an object from storage.
     *
     * @param path The relative storage path
     * @return Raw byte array of the file
     */
    byte[] download(String path);

    /**
     * Deletes an object from storage.
     *
     * @param path The relative storage path
     */
    void delete(String path);

    /**
     * Checks if an object exists at the specified path.
     *
     * @param path The relative storage path
     * @return true if object exists, false otherwise
     */
    boolean exists(String path);
}
