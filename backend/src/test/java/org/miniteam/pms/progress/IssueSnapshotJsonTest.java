package org.miniteam.pms.progress;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.miniteam.pms.progress.dto.OverviewVO;
import org.miniteam.pms.progress.service.IssueSnapshotService;
import org.miniteam.pms.task.ProjectTaskSnapshot;
import org.miniteam.pms.task.entity.Task;

/** 往期快照里存的是原始任务、依赖、成员：存成 JSON 再读回来，算出的结果要和直接算的一样。 */
class IssueSnapshotJsonTest {

    @Test
    void storedStateRoundTripsAndGivesTheSameOverview() {
        ProjectData live = ProgressCalculatorTest.data();
        live.members().get(0).setJoinedAt(LocalDateTime.parse("2026-10-19T09:30:00"));
        live.members().get(0).setSkillTags(List.of("后端", "测试"));
        live.snap().tasks.get(0).setRequiredSkills(List.of("设计"));

        String json = IssueSnapshotService.encode(
                new IssueSnapshotService.StoredState(live.snap().tasks, live.snap().deps, live.members()));
        // 日期存成 ISO 字符串
        assertTrue(json.contains("\"planStart\":\"2026-10-19\""));
        IssueSnapshotService.StoredState state = IssueSnapshotService.decode(json);

        assertEquals(5, state.tasks().size());
        assertEquals(LocalDate.parse("2026-10-19"), state.tasks().get(0).getPlanStart());
        assertEquals(List.of("设计"), state.tasks().get(0).getRequiredSkills());
        assertEquals(3, state.dependencies().size());
        assertEquals(
                LocalDateTime.parse("2026-10-19T09:30:00"),
                state.members().get(0).getJoinedAt());
        assertEquals(List.of("后端", "测试"), state.members().get(0).getSkillTags());

        ProjectTaskSnapshot snap = new ProjectTaskSnapshot(
                ProgressCalculatorTest.data().today(), state.tasks(), state.dependencies(), Map.of());
        ProjectData restored = new ProjectData(live.startDate(), live.planEnd(), snap, state.members());
        OverviewVO a = ProgressCalculator.overview(live, ProgressCalculatorTest.PM, 5);
        OverviewVO b = ProgressCalculator.overview(restored, ProgressCalculatorTest.PM, 5);
        assertEquals(a, b);
        Task first = state.tasks().get(0);
        assertEquals(1L, first.getId());
    }

    @Test
    void unknownFieldsInOldSnapshotsAreIgnored() {
        var state = IssueSnapshotService.decode(
                "{\"tasks\":[{\"id\":7,\"title\":\"x\",\"removedField\":1}],\"dependencies\":[],\"members\":[]}");
        assertEquals(7L, state.tasks().get(0).getId());
        assertTrue(state.members().isEmpty());
    }
}
