package com.careerreach.repository;

import com.careerreach.entity.CampaignRecipient;
import com.careerreach.entity.CampaignRecipientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignRecipientRepository extends JpaRepository<CampaignRecipient, UUID> {

    List<CampaignRecipient> findByCampaignIdOrderByStatusAsc(UUID campaignId);

    List<CampaignRecipient> findByCampaignIdAndStatus(UUID campaignId, CampaignRecipientStatus status);

    @org.springframework.data.jpa.repository.Query(
        "SELECT cr FROM CampaignRecipient cr " +
        "JOIN FETCH cr.contact " +
        "JOIN FETCH cr.campaign c " +
        "JOIN FETCH c.user " +
        "JOIN FETCH c.template " +
        "WHERE c.id = :campaignId AND cr.status = :status"
    )
    List<CampaignRecipient> findByCampaignIdAndStatusWithDetails(
            @org.springframework.data.repository.query.Param("campaignId") UUID campaignId,
            @org.springframework.data.repository.query.Param("status") CampaignRecipientStatus status);

    long countByCampaignIdAndStatus(UUID campaignId, CampaignRecipientStatus status);

    @org.springframework.data.jpa.repository.Query(
        "SELECT DISTINCT cr.contact.id FROM CampaignRecipient cr " +
        "WHERE cr.campaign.user.id = :userId " +
        "AND cr.campaign.template.id = :templateId " +
        "AND cr.status = com.careerreach.entity.CampaignRecipientStatus.SENT " +
        "AND cr.contact.id IN :contactIds"
    )
    List<UUID> findSentContactIdsByTemplate(
            @org.springframework.data.repository.query.Param("userId") UUID userId,
            @org.springframework.data.repository.query.Param("templateId") UUID templateId,
            @org.springframework.data.repository.query.Param("contactIds") List<UUID> contactIds);

    @org.springframework.data.jpa.repository.Query(
        "SELECT DISTINCT cr.contact.id FROM CampaignRecipient cr " +
        "WHERE cr.campaign.user.id = :userId " +
        "AND cr.status = com.careerreach.entity.CampaignRecipientStatus.SENT " +
        "AND cr.contact.id IN :contactIds"
    )
    List<UUID> findSentContactIdsAny(
            @org.springframework.data.repository.query.Param("userId") UUID userId,
            @org.springframework.data.repository.query.Param("contactIds") List<UUID> contactIds);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
        "UPDATE CampaignRecipient cr SET cr.status = com.careerreach.entity.CampaignRecipientStatus.PENDING " +
        "WHERE cr.status = com.careerreach.entity.CampaignRecipientStatus.SENDING"
    )
    int resetOrphanedSendingRecipients();
}
