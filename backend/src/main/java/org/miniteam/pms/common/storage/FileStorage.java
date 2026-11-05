package org.miniteam.pms.common.storage;

import java.io.IOException;
import java.io.InputStream;

/**
 * 上传文件的存取，业务代码只认这个接口，不知道背后是什么存储。
 * key 是对象在桶里的路径，由调用方生成（不要用用户给的文件名拼）。
 * 现在的实现是 {@link S3FileStorage}（S3 协议：自建 MinIO、阿里云 OSS、腾讯 COS 通用）。
 */
public interface FileStorage {

    /** 把流存到 key，已存在则覆盖。size 是字节数，流由调用方关闭 */
    void save(String key, InputStream content, long size, String contentType) throws IOException;

    /** 打开对象读取，由调用方关闭；对象不存在抛 {@link java.io.FileNotFoundException} */
    InputStream open(String key) throws IOException;

    /** 删对象，不存在也不报错 */
    void delete(String key) throws IOException;
}
