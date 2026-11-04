package org.miniteam.pms.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** 打开 @Scheduled：每日零点生成往期日报快照。 */
@Configuration
@EnableScheduling
public class SchedulingConfig {}
