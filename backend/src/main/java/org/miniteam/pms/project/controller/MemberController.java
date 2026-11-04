package org.miniteam.pms.project.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.project.dto.MemberAdd;
import org.miniteam.pms.project.dto.MemberUpdate;
import org.miniteam.pms.project.dto.MemberVO;
import org.miniteam.pms.project.dto.PermissionsUpdate;
import org.miniteam.pms.project.service.MemberService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/projects/{projectId}/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public Result<List<MemberVO>> list(@PathVariable Long projectId) {
        return Result.ok(memberService.list(projectId));
    }

    @PostMapping
    public Result<MemberVO> add(@PathVariable Long projectId, @Valid @RequestBody MemberAdd request) {
        return Result.ok(memberService.add(projectId, request));
    }

    @PutMapping("/{userId}")
    public Result<MemberVO> update(
            @PathVariable Long projectId, @PathVariable Long userId, @Valid @RequestBody MemberUpdate request) {
        return Result.ok(memberService.update(projectId, userId, request));
    }

    @PutMapping("/{userId}/permissions")
    public Result<MemberVO> updatePermissions(
            @PathVariable Long projectId, @PathVariable Long userId, @Valid @RequestBody PermissionsUpdate request) {
        return Result.ok(memberService.updatePermissions(projectId, userId, request));
    }
}
