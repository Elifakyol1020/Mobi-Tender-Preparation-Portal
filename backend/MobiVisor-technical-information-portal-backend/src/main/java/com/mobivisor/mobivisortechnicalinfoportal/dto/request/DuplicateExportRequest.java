package com.mobivisor.mobivisortechnicalinfoportal.dto.request;

import java.util.List;

public record DuplicateExportRequest(List<Long> selectedIds,String newSpecificationName) {
}
