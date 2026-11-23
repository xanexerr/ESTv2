<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include 'header.php'; ?>
<body>
    <?php
    include 'navbar.php';
    include 'php/admin-check.php';

    $totalWorkplaces   = (int)$conn->query("SELECT COUNT(*) FROM workplaces")->fetchColumn();
    $visibleWorkplaces = (int)$conn->query("SELECT COUNT(*) FROM workplaces WHERE `show` = 1")->fetchColumn();
    $hiddenWorkplaces  = $totalWorkplaces - $visibleWorkplaces;

    $limit            = 12;
    $search_query     = isset($_GET['search_query']) ? trim($_GET['search_query']) : '';
    $work_type_filter = isset($_GET['work_type_filter']) ? trim($_GET['work_type_filter']) : '';

    $whereClauses = ["w.workplace_name LIKE :search_query"];
    $params       = [':search_query' => "%$search_query%"];

    if ($work_type_filter !== '') {
        $whereClauses[]              = "w.work_type = :work_type_filter";
        $params[':work_type_filter'] = $work_type_filter;
    }

    $whereSql = implode(' AND ', $whereClauses);

    $stmt = $conn->prepare("SELECT COUNT(*) FROM workplaces w WHERE $whereSql");
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v, PDO::PARAM_STR);
    }
    $stmt->execute();
    $totalRows   = (int)$stmt->fetchColumn();
    $totalPages  = max(1, (int)ceil($totalRows / $limit));
    $currentPage = isset($_GET['page']) && is_numeric($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $offset      = ($currentPage - 1) * $limit;

    $query = "SELECT * FROM workplaces w WHERE $whereSql ORDER BY w.workplace_id DESC LIMIT :limit OFFSET :offset";
    $stmt  = $conn->prepare($query);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $workplacesData = $stmt->fetchAll();

    $workTypes = getWorkTypes();
    ?>

    <main class="container my-4 flex-grow-1">
        <!-- Header & Add Action -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <div>
                <h1 class="h4 fw-bold mb-1">
                    <i class="fa-solid fa-building-circle-check me-2" style="color: var(--ssp-primary);"></i>เมนูแก้ไขข้อมูลสถานประกอบการ
                </h1>
                <p class="text-secondary small mb-0">จัดการรายชื่อสถานประกอบการ สถานะการแสดงผล และรายละเอียดทั้งหมดในระบบ</p>
            </div>
            <a href="admin-add-form.php" class="btn btn-ssp-primary rounded-pill px-4 fw-semibold">
                <i class="fa-solid fa-circle-plus me-1"></i> เพิ่มสถานประกอบการ
            </a>
        </div>

        <!-- Summary Cards -->
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="ssp-stat-card">
                    <div class="ssp-stat-icon" style="background: var(--ssp-primary-light); color: var(--ssp-primary);">
                        <i class="fa-solid fa-building"></i>
                    </div>
                    <div>
                        <div class="text-secondary small">จำนวนสถานประกอบการทั้งหมด</div>
                        <div class="h4 fw-bold mb-0"><?php echo number_format($totalWorkplaces); ?></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="ssp-stat-card">
                    <div class="ssp-stat-icon" style="background: rgba(22, 163, 74, 0.12); color: #16A34A;">
                        <i class="fa-solid fa-eye"></i>
                    </div>
                    <div>
                        <div class="text-secondary small">กำลังแสดงผลบนเว็บไซต์</div>
                        <div class="h4 fw-bold mb-0"><?php echo number_format($visibleWorkplaces); ?></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="ssp-stat-card">
                    <div class="ssp-stat-icon" style="background: rgba(220, 38, 38, 0.12); color: #DC2626;">
                        <i class="fa-solid fa-eye-slash"></i>
                    </div>
                    <div>
                        <div class="text-secondary small">ซ่อน / ไม่แสดงผล</div>
                        <div class="h4 fw-bold mb-0"><?php echo number_format($hiddenWorkplaces); ?></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter & Search -->
        <div class="ssp-card p-3 mb-4">
            <form method="GET" action="admin-wp.php" class="row g-2 align-items-center">
                <div class="col-md-3">
                    <select class="form-select" name="work_type_filter" onchange="this.form.submit()">
                        <option value="">ประเภทงานทั้งหมด</option>
                        <?php foreach ($workTypes as $typeKey => $meta): ?>
                            <option value="<?php echo e($typeKey); ?>" <?php echo ($work_type_filter === $typeKey) ? 'selected' : ''; ?>>
                                ประเภทงาน<?php echo e($meta['label']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-7">
                    <input type="text" class="form-control" placeholder="ค้นหาสถานประกอบการ...."
                        name="search_query" value="<?php echo e($search_query); ?>">
                </div>
                <div class="col-md-2 d-grid">
                    <button class="btn btn-ssp-primary" type="submit">
                        <i class="fa-solid fa-magnifying-glass me-1"></i> ค้นหา
                    </button>
                </div>
            </form>
        </div>

        <!-- Table -->
        <div class="ssp-table-wrapper">
            <div class="table-responsive">
                <?php if ($totalRows > 0): ?>
                    <table class="table ssp-table table-hover">
                        <thead>
                            <tr>
                                <th class="text-center col-1">รหัส</th>
                                <th class="col-3">ชื่อสถานประกอบการ</th>
                                <th class="text-center col-2">ประเภทงาน</th>
                                <th class="col-3">รายละเอียด</th>
                                <th class="text-center col-1">สถานะ</th>
                                <th class="text-center col-2">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($workplacesData as $row):
                                $meta = getWorkTypeMeta($row['work_type']);
                            ?>
                                <tr>
                                    <td class="text-center fw-semibold text-secondary">#<?php echo e($row['workplace_id']); ?></td>
                                    <td class="fw-semibold"><?php echo e($row['workplace_name']); ?></td>
                                    <td class="text-center">
                                        <span class="ssp-type-badge" style="background: <?php echo e($meta['bg']); ?>; color: <?php echo e($meta['color']); ?>;">
                                            <i class="<?php echo e($meta['icon']); ?>"></i> <?php echo e($meta['label']); ?>
                                        </span>
                                    </td>
                                    <td class="text-secondary small"><?php echo e($row['description']); ?></td>
                                    <td class="text-center">
                                        <?php if ((int)$row['show'] === 1): ?>
                                            <span class="ssp-status-badge status-active">
                                                <i class="fa-solid fa-circle-check"></i> แสดง
                                            </span>
                                        <?php else: ?>
                                            <span class="ssp-status-badge status-hidden">
                                                <i class="fa-solid fa-circle-xmark"></i> ไม่แสดง
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-center">
                                        <div class="d-inline-flex gap-1">
                                            <a class="btn btn-sm btn-outline-primary rounded-pill px-3"
                                               href="wp-detail.php?id=<?php echo e($row['workplace_id']); ?>">
                                                รายละเอียด
                                            </a>
                                            <a href="admin-wp-edit.php?id=<?php echo e($row['workplace_id']); ?>"
                                               class="btn btn-sm btn-ssp-amber rounded-pill px-3">
                                                แก้ไขข้อมูล
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <div class="p-5 text-center text-secondary">ไม่พบข้อมูลสถานประกอบการ</div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
            <div class="my-4">
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center m-0">
                        <?php if ($currentPage > 1): ?>
                            <li class="page-item">
                                <a class="page-link" href="?page=<?php echo ($currentPage - 1) . ($work_type_filter !== '' ? '&work_type_filter=' . urlencode($work_type_filter) : '') . ($search_query !== '' ? '&search_query=' . urlencode($search_query) : ''); ?>">
                                    <i class="fa-solid fa-chevron-left"></i>
                                </a>
                            </li>
                        <?php endif; ?>
                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <li class="page-item <?php echo ($i === $currentPage) ? 'active' : ''; ?>">
                                <a class="page-link" href="?page=<?php echo $i . ($work_type_filter !== '' ? '&work_type_filter=' . urlencode($work_type_filter) : '') . ($search_query !== '' ? '&search_query=' . urlencode($search_query) : ''); ?>">
                                    <?php echo $i; ?>
                                </a>
                            </li>
                        <?php endfor; ?>
                        <?php if ($currentPage < $totalPages): ?>
                            <li class="page-item">
                                <a class="page-link" href="?page=<?php echo ($currentPage + 1) . ($work_type_filter !== '' ? '&work_type_filter=' . urlencode($work_type_filter) : '') . ($search_query !== '' ? '&search_query=' . urlencode($search_query) : ''); ?>">
                                    <i class="fa-solid fa-chevron-right"></i>
                                </a>
                            </li>
                        <?php endif; ?>
                    </ul>
                </nav>
            </div>
        <?php endif; ?>
    </main>

    <?php include "script.php"; ?>
    <script>
        addClassToElement("wmanage");
    </script>
</body>
</html>
