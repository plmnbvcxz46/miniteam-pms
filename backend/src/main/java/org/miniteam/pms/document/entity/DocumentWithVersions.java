package org.miniteam.pms.document.entity;

import java.util.List;

/** 一份文档和它的全部版本（新的在前），往期存档里存的就是这个。 */
public record DocumentWithVersions(Document document, List<DocumentVersion> versions) {}
