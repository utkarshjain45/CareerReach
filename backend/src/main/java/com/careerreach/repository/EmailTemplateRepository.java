package com.careerreach.repository;

import com.careerreach.entity.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, UUID> {

    Optional<EmailTemplate> findByIdAndUserId(UUID id, UUID userId);

    List<EmailTemplate> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    @Query("SELECT t FROM EmailTemplate t WHERE t.user.id = :userId " +
           "AND (:search IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY t.updatedAt DESC")
    List<EmailTemplate> searchByUserId(@Param("userId") UUID userId, @Param("search") String search);

    long countByUserId(UUID userId);

    @Modifying
    @Query(value = "DELETE FROM template_attachments WHERE template_id = :templateId", nativeQuery = true)
    void deleteTemplateAttachments(@Param("templateId") UUID templateId);

    @Modifying
    @Query("DELETE FROM EmailTemplate t WHERE t.user.id = :userId AND t.id = :id")
    int deleteByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
