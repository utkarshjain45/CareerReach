package com.careerreach.repository;

import com.careerreach.entity.Contact;
import com.careerreach.entity.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {

    Optional<Contact> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndEmailIgnoreCase(UUID userId, String email);

    List<Contact> findByUserIdAndEmailInIgnoreCase(UUID userId, Collection<String> emails);

    @Query("""
        SELECT c FROM Contact c
        WHERE c.user.id = :userId
          AND (:status IS NULL OR c.status = :status)
          AND (
              :search IS NULL OR :search = ''
              OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(COALESCE(c.company, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(COALESCE(c.position, '')) LIKE LOWER(CONCAT('%', :search, '%'))
          )
    """)
    Page<Contact> searchContacts(
            @Param("userId") UUID userId,
            @Param("status") ContactStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    List<Contact> findByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, ContactStatus status);

    @Modifying
    @Query("DELETE FROM Contact c WHERE c.user.id = :userId AND c.id = :id")
    int deleteByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Modifying
    @Query("DELETE FROM Contact c WHERE c.user.id = :userId AND c.id IN :ids")
    int deleteByUserIdAndIdIn(@Param("userId") UUID userId, @Param("ids") Collection<UUID> ids);
}
