package org.miniteam.pms.document;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** 文档版本号 v主.次（如 v0.6）：格式检查和下一个版本号。 */
public final class DocumentVersionNo {

    private static final Pattern FORMAT = Pattern.compile("^v(\\d{1,4})\\.(\\d{1,4})$");

    private DocumentVersionNo() {}

    public static boolean valid(String version) {
        return version != null && FORMAT.matcher(version).matches();
    }

    /** 第一个版本是 v0.1，之后次版本号加 1；当前版本号读不出来时也从 v0.1 起 */
    public static String next(String current) {
        if (current == null) {
            return "v0.1";
        }
        Matcher m = FORMAT.matcher(current);
        if (!m.matches()) {
            return "v0.1";
        }
        return "v" + m.group(1) + "." + (Integer.parseInt(m.group(2)) + 1);
    }
}
