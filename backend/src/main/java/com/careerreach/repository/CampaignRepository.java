package com.careerreach.repository;

import com.careerreach.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {

    Optional<Campaign> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT c FROM Campaign c " +
           "JOIN FETCH c.user " +
           "JOIN FETCH c.template " +
           "WHERE c.id = :id")
    Optional<Campaign> findByIdWithDetails(@Param("id") UUID id);

    List<Campaign> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Campaign> findTop5ByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, com.careerreach.entity.CampaignStatus status);

    long countByUserIdAndStatusIn(UUID userId, java.util.Collection<com.careerreach.entity.CampaignStatus> statuses);

    List<Campaign> findByStatusIn(java.util.Collection<com.careerreach.entity.CampaignStatus> statuses);

    @Query("SELECT COALESCE(SUM(c.sentCount), 0) FROM Campaign c WHERE c.user.id = :userId")
    long sumSentCountByUserId(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(c.failedCount), 0) FROM Campaign c WHERE c.user.id = :userId")
    long sumFailedCountByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(c) > 0 FROM Campaign c JOIN c.attachments a WHERE a.id = :attachmentId AND c.status = :status")
    boolean existsByAttachmentIdAndStatus(@Param("attachmentId") UUID attachmentId, @Param("status") com.careerreach.entity.CampaignStatus status);

    @Query("SELECT COUNT(c) > 0 FROM Campaign c JOIN c.template t JOIN t.attachments a WHERE a.id = :attachmentId AND c.status = :status")
    boolean existsByTemplateAttachmentIdAndStatus(@Param("attachmentId") UUID attachmentId, @Param("status") com.careerreach.entity.CampaignStatus status);

    @Modifying
    @Query(value = "DELETE FROM campaign_attachments WHERE campaign_id = :campaignId", nativeQuery = true)
    void deleteCampaignAttachments(@Param("campaignId") UUID campaignId);

    @Modifying
    @Query("DELETE FROM Campaign c WHERE c.user.id = :userId AND c.id = :id")
    int deleteByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
