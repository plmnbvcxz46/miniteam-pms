package org.miniteam.pms.report;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * 不加任何依赖，手写一个只有一张表的 .xlsx（zip 包里几份 XML）。和前端原来的 utils/xlsx.ts 做法一致：
 * 文字用内联字符串，数字直接写值，空字符串留空格子。
 */
public final class XlsxWriter {

    private XlsxWriter() {}

    private static final String XML_HEAD = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>";

    /** rows 里的格子是 String 或 Number，其他类型按字符串写；columnWidths 是每列宽度（字符数） */
    public static byte[] build(String sheetName, List<List<Object>> rows, int[] columnWidths) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(out, StandardCharsets.UTF_8)) {
            put(
                    zip,
                    "[Content_Types].xml",
                    XML_HEAD
                            + "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">"
                            + "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>"
                            + "<Default Extension=\"xml\" ContentType=\"application/xml\"/>"
                            + "<Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/>"
                            + "<Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>"
                            + "</Types>");
            put(
                    zip,
                    "_rels/.rels",
                    XML_HEAD
                            + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                            + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/>"
                            + "</Relationships>");
            put(
                    zip,
                    "xl/workbook.xml",
                    XML_HEAD
                            + "<workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">"
                            + "<sheets><sheet name=\"" + escape(sheetName)
                            + "\" sheetId=\"1\" r:id=\"rId1\"/></sheets></workbook>");
            put(
                    zip,
                    "xl/_rels/workbook.xml.rels",
                    XML_HEAD
                            + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                            + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet1.xml\"/>"
                            + "</Relationships>");
            put(zip, "xl/worksheets/sheet1.xml", sheetXml(rows, columnWidths));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return out.toByteArray();
    }

    private static void put(ZipOutputStream zip, String name, String content) throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(content.getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }

    static String sheetXml(List<List<Object>> rows, int[] columnWidths) {
        StringBuilder sb = new StringBuilder(XML_HEAD);
        sb.append("<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">");
        if (columnWidths.length > 0) {
            sb.append("<cols>");
            for (int i = 0; i < columnWidths.length; i++) {
                sb.append("<col min=\"")
                        .append(i + 1)
                        .append("\" max=\"")
                        .append(i + 1)
                        .append("\" width=\"")
                        .append(columnWidths[i])
                        .append("\" customWidth=\"1\"/>");
            }
            sb.append("</cols>");
        }
        sb.append("<sheetData>");
        for (int r = 0; r < rows.size(); r++) {
            sb.append("<row r=\"").append(r + 1).append("\">");
            List<Object> row = rows.get(r);
            for (int c = 0; c < row.size(); c++) {
                Object cell = row.get(c);
                String ref = columnName(c) + (r + 1);
                if (cell instanceof Number n) {
                    sb.append("<c r=\"")
                            .append(ref)
                            .append("\"><v>")
                            .append(number(n))
                            .append("</v></c>");
                } else if (cell != null && !cell.toString().isEmpty()) {
                    sb.append("<c r=\"")
                            .append(ref)
                            .append("\" t=\"inlineStr\"><is><t xml:space=\"preserve\">")
                            .append(escape(cell.toString()))
                            .append("</t></is></c>");
                }
            }
            sb.append("</row>");
        }
        return sb.append("</sheetData></worksheet>").toString();
    }

    /** 整数不带小数点，其余保留原样 */
    private static String number(Number n) {
        double v = n.doubleValue();
        return v == Math.rint(v) && Math.abs(v) < 1e15 ? String.valueOf((long) v) : String.valueOf(v);
    }

    /** 第 0 列是 A，第 26 列是 AA */
    static String columnName(int index) {
        StringBuilder name = new StringBuilder();
        for (int n = index + 1; n > 0; n = (n - 1) / 26) {
            name.insert(0, (char) ('A' + (n - 1) % 26));
        }
        return name.toString();
    }

    /** 把 XML 里有特殊含义的字符转成数字实体，控制字符（Excel 不认）去掉 */
    static String escape(String text) {
        StringBuilder sb = new StringBuilder();
        for (char ch : text.toCharArray()) {
            if (ch == '&' || ch == '<' || ch == '>' || ch == '"') {
                sb.append("&#").append((int) ch).append(';');
            } else if (ch < 0x20 && ch != '\t' && ch != '\n' && ch != '\r') {
                continue;
            } else {
                sb.append(ch);
            }
        }
        return sb.toString();
    }
}
