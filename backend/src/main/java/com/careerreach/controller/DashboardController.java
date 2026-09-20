package com.careerreach.controller;

import com.careerreach.dto.ApiResponse;
import com.careerreach.dto.DashboardStatsResponse;
import com.careerreach.security.UserPrincipal;
import com.careerreach.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        DashboardStatsResponse stats = dashboardService.getStats(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved", stats));
    }
}
