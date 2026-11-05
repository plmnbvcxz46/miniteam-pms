package org.miniteam.pms.common.mybatis;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

/** MySQL JSON 列 ⇄ List&lt;Long&gt;（评论里 @ 的用户 ID、文档 ID）。列为空时读出空列表。 */
public class JsonLongListTypeHandler extends BaseTypeHandler<List<Long>> {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();
    private static final TypeReference<List<Long>> TYPE = new TypeReference<>() {};

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<Long> parameter, JdbcType jdbcType)
            throws SQLException {
        ps.setString(i, MAPPER.writeValueAsString(parameter));
    }

    @Override
    public List<Long> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parse(rs.getString(columnName));
    }

    @Override
    public List<Long> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parse(rs.getString(columnIndex));
    }

    @Override
    public List<Long> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parse(cs.getString(columnIndex));
    }

    private static List<Long> parse(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        return MAPPER.readValue(json, TYPE);
    }
}
