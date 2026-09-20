package com.careerreach.repository;

import com.careerreach.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

    Optional<Attachment> findByIdAndUserId(UUID id, UUID userId);

    List<Attachment> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("SELECT a FROM Attachment a WHERE a.id IN :ids AND a.user.id = :userId")
    List<Attachment> findAllByIdInAndUserId(@Param("ids") Collection<UUID> ids, @Param("userId") UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
