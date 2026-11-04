package org.miniteam.pms.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.junit.jupiter.api.Test;

class XlsxWriterTest {

    static Map<String, String> unzip(byte[] bytes) throws IOException {
        Map<String, String> files = new LinkedHashMap<>();
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(bytes), StandardCharsets.UTF_8)) {
            for (ZipEntry e = zip.getNextEntry(); e != null; e = zip.getNextEntry()) {
                files.put(e.getName(), new String(zip.readAllBytes(), StandardCharsets.UTF_8));
            }
        }
        return files;
    }

    @Test
    void writesAReadableWorkbook() throws IOException {
        List<List<Object>> rows = new ArrayList<>();
        rows.add(List.of("概况"));
        rows.add(List.of("任务总数", 12));
        rows.add(List.of());
        rows.add(List.of("完成率", "40%", "", 2.5));
        byte[] bytes = XlsxWriter.build("统计报表", rows, new int[] {18, 12});

        Map<String, String> files = unzip(bytes);
        assertEquals(
                List.of(
                        "[Content_Types].xml",
                        "_rels/.rels",
                        "xl/workbook.xml",
                        "xl/_rels/workbook.xml.rels",
                        "xl/worksheets/sheet1.xml"),
                List.copyOf(files.keySet()));
        assertTrue(files.get("xl/workbook.xml").contains("name=\"统计报表\""));
        String sheet = files.get("xl/worksheets/sheet1.xml");
        assertTrue(sheet.contains("<col min=\"1\" max=\"1\" width=\"18\" customWidth=\"1\"/>"));
        assertTrue(sheet.contains("<c r=\"A1\" t=\"inlineStr\"><is><t xml:space=\"preserve\">概况</t></is></c>"));
        // 整数不带小数点，小数原样
        assertTrue(sheet.contains("<c r=\"B2\"><v>12</v></c>"));
        assertTrue(sheet.contains("<c r=\"D4\"><v>2.5</v></c>"));
        // 空字符串留空格子，空行还在
        assertTrue(!sheet.contains("r=\"C4\""));
        assertTrue(sheet.contains("<row r=\"3\"></row>"));
    }

    @Test
    void escapesSpecialCharactersAndDropsControlCharacters() {
        assertEquals("a&#38;b&#60;c&#62;d&#34;e", XlsxWriter.escape("a&b<c>d\"e"));
        assertEquals("ab", XlsxWriter.escape("a\u0001b"));
        assertEquals("中文 ok", XlsxWriter.escape("中文 ok"));
    }

    @Test
    void columnNamesRunPastZ() {
        assertEquals("A", XlsxWriter.columnName(0));
        assertEquals("Z", XlsxWriter.columnName(25));
        assertEquals("AA", XlsxWriter.columnName(26));
    }

    @Test
    void exportRowsFollowTheReportLayout() {
        var reports = ReportCalculator.build(
                org.miniteam.pms.progress.ProgressCalculatorTest.data(),
                org.miniteam.pms.progress.ProgressCalculatorTest.PM);
        List<List<Object>> rows = ReportExport.rows(reports);
        assertEquals(List.of("概况"), rows.get(0));
        assertEquals(List.of("当前周", "03/04"), rows.get(1));
        assertEquals(List.of("完成率", "40%"), rows.get(5));
        assertEquals(List.of("成员", "本周工时", "未完成工时", "每周上限", "负责任务数"), rows.get(9));
        assertEquals(List.of("周起始", "完成任务数"), rows.get(9 + 1 + 3 + 1));
    }
}
