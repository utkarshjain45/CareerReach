package com.careerreach.repository;

import com.careerreach.entity.GmailConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GmailConnectionRepository extends JpaRepository<GmailConnection, UUID> {

    Optional<GmailConnection> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    @Modifying
    @Query("DELETE FROM GmailConnection g WHERE g.user.id = :userId")
    int deleteByUserId(@Param("userId") UUID userId);
}
