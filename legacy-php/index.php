<?php
require('connection.php');
?>
<!DOCTYPE html>
<html lang="th">
<?php include 'header.php'; ?>
<body>
    <?php include 'navbar.php'; ?>

    <?php
    $limit = 15;
    $search_query     = isset($_GET['search_query']) ? trim($_GET['search_query']) : '';
    $work_type_filter = isset($_GET['work_type_filter']) ? trim($_GET['work_type_filter']) : '';
    $sorting          = isset($_GET['sorting']) && $_GET['sorting'] !== '' ? $_GET['sorting'] : 'newest';
    $view_mode        = isset($_GET['view']) && $_GET['view'] === 'table' ? 'table' : 'card';

    // Determine SQL sorting order
    switch ($sorting) {
        case 'highscore':
            $sortSql = "ORDER BY CAST(w.rating AS DECIMAL(4,2)) DESC, w.workplace_id DESC";
            break;
        case 'oldest':
            $sortSql = "ORDER BY w.workplace_id ASC";
            break;
        case 'popular':
            $sortSql = "ORDER BY student_count DESC, CAST(w.rating AS DECIMAL(4,2)) DESC";
            break;
        case 'newest':
        default:
            $sorting = 'newest';
            $sortSql = "ORDER BY w.workplace_id DESC";
            break;
    }

    // Build dynamic WHERE clause (only visible workplaces)
    $whereClauses = ["w.`show` = '1'"];
    $params       = [];

    if ($search_query !== '') {
        $whereClauses[] = "(w.workplace_name LIKE :sq OR w.description LIKE :sq OR w.workplace_address LIKE :sq)";
        $params[':sq']  = "%$search_query%";
    }

    if ($work_type_filter !== '') {
        $whereClauses[]   = "w.work_type = :wtype";
        $params[':wtype'] = $work_type_filter;
    }

    $whereSql = implode(' AND ', $whereClauses);

    // Count total matching rows
    $countStmt = $conn->prepare("SELECT COUNT(*) FROM workplaces w WHERE $whereSql");
    foreach ($params as $k => $v) {
        $countStmt->bindValue($k, $v, PDO::PARAM_STR);
    }
    $countStmt->execute();
    $totalRows   = (int)$countStmt->fetchColumn();
    $totalPages  = max(1, (int)ceil($totalRows / $limit));
    $currentPage = isset($_GET['page']) && is_numeric($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $offset      = ($currentPage - 1) * $limit;

    // Fetch paginated workplaces with student count and comment count
    $listSql = "
        SELECT w.*,
               (SELECT COUNT(*) FROM users u WHERE u.workplace_id = w.workplace_id) AS student_count,
               (SELECT COUNT(*) FROM comments c WHERE c.workplace_id = w.workplace_id AND c.`show` = 1) AS review_count
        FROM workplaces w
        WHERE $whereSql
        $sortSql
        LIMIT :limit OFFSET :offset
    ";
    $stmt = $conn->prepare($listSql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $workplacesData = $stmt->fetchAll();

    // Fetch Top 3 Most Recommended & Top 3 Most Popular for discovery home (when not actively searching)
    $isFiltered = ($search_query !== '' || $work_type_filter !== '');
    $topRated = [];
    $topPopular = [];
    if (!$isFiltered && $currentPage === 1) {
        $topRatedStmt = $conn->query("
            SELECT w.*,
                   (SELECT COUNT(*) FROM users u WHERE u.workplace_id = w.workplace_id) AS student_count,
                   (SELECT COUNT(*) FROM comments c WHERE c.workplace_id = w.workplace_id AND c.`show` = 1) AS review_count
            FROM workplaces w
            WHERE w.`show` = '1'
            ORDER BY CAST(w.rating AS DECIMAL(4,2)) DESC, review_count DESC, w.workplace_id DESC
            LIMIT 3
        ");
        $topRated = $topRatedStmt->fetchAll();

        $topPopularStmt = $conn->query("
            SELECT w.*,
                   (SELECT COUNT(*) FROM users u WHERE u.workplace_id = w.workplace_id) AS student_count,
                   (SELECT COUNT(*) FROM comments c WHERE c.workplace_id = w.workplace_id AND c.`show` = 1) AS review_count
            FROM workplaces w
            WHERE w.`show` = '1'
            ORDER BY student_count DESC, review_count DESC, CAST(w.rating AS DECIMAL(4,2)) DESC
            LIMIT 3
        ");
        $topPopular = $topPopularStmt->fetchAll();
    }

    function buildQueryString(array $overrides = []): string
    {
        $params = [
            'search_query'     => $_GET['search_query'] ?? '',
            'work_type_filter' => $_GET['work_type_filter'] ?? '',
            'sorting'          => $_GET['sorting'] ?? '',
            'view'             => $_GET['view'] ?? '',
        ];
        foreach ($overrides as $k => $v) {
            $params[$k] = $v;
        }
        $qs = '';
        foreach ($params as $k => $v) {
            if ($v !== '' && $v !== null) {
                $qs .= '&' . urlencode($k) . '=' . urlencode((string)$v);
            }
        }
        return $qs;
    }

    $workTypes = getWorkTypes();
    ?>

    <main class="container my-4 flex-grow-1">
        <!-- Hero & Search / Filter Section -->
        <section class="ssp-hero">
            <div class="row align-items-center g-4">
                <div class="col-lg-12">
                    <div class="d-flex flex-wrap justify-content-between align-items-end mb-3 gap-2">
                        <div>
                            <span class="badge rounded-pill px-3 py-1 mb-2" style="background: rgba(255, 183, 43, 0.2); color: #FFB72B; border: 1px solid rgba(255, 183, 43, 0.4);">
                                <i class="fa-solid fa-sparkles me-1"></i> HTC Internship Discovery
                            </span>
                            <h1 class="h3 fw-bold mb-1">ค้นหาสถานประกอบการฝึกประสบการณ์วิชาชีพ</h1>
                            <p class="mb-0 opacity-75 small">รวบรวมข้อมูลสถานที่ฝึกงาน รีวิวจากรุ่นพี่ และคะแนนประเมินสำหรับนักศึกษาแผนกเทคโนโลยีสารสนเทศ</p>
                        </div>
                        <div class="text-white-50 small">
                            พบสถานประกอบการทั้งหมด <strong class="text-white fs-6"><?php echo number_format($totalRows); ?></strong> แห่ง
                        </div>
                    </div>

                    <form method="GET" action="index.php" id="filterForm">
                        <input type="hidden" name="view" value="<?php echo e($view_mode); ?>">
                        <div class="ssp-search-box">
                            <div class="row g-2 align-items-center">
                                <div class="col-lg-5 col-md-12">
                                    <div class="input-group">
                                        <span class="input-group-text bg-transparent border-0 text-secondary ps-3">
                                            <i class="fa-solid fa-magnifying-glass"></i>
                                        </span>
                                        <input type="text" class="form-control ssp-search-input"
                                            placeholder="ค้นหาชื่อสถานประกอบการ, ลักษณะงาน, หรือพื้นที่..."
                                            name="search_query" value="<?php echo e($search_query); ?>">
                                    </div>
                                </div>

                                <div class="col-lg-3 col-md-5">
                                    <select class="form-select ssp-filter-select" name="work_type_filter" onchange="this.form.submit()">
                                        <option value="">ประเภทงาน : ทั้งหมด</option>
                                        <?php foreach ($workTypes as $typeKey => $meta): ?>
                                            <option value="<?php echo e($typeKey); ?>" <?php echo ($work_type_filter === $typeKey) ? 'selected' : ''; ?>>
                                                ประเภทงาน : <?php echo e($meta['label']); ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>

                                <div class="col-lg-2 col-md-4">
                                    <select class="form-select ssp-filter-select" name="sorting" onchange="this.form.submit()">
                                        <option value="newest" <?php echo ($sorting === 'newest') ? 'selected' : ''; ?>>เรียงจากที่เพิ่มล่าสุด</option>
                                        <option value="oldest" <?php echo ($sorting === 'oldest') ? 'selected' : ''; ?>>เรียงจากที่เพิ่มนานสุด</option>
                                        <option value="highscore" <?php echo ($sorting === 'highscore') ? 'selected' : ''; ?>>เรียงจากคะแนนรีวิว</option>
                                        <option value="popular" <?php echo ($sorting === 'popular') ? 'selected' : ''; ?>>เรียงจากความนิยม</option>
                                    </select>
                                </div>

                                <div class="col-lg-2 col-md-3 d-grid">
                                    <button class="btn btn-ssp-primary py-2 fw-semibold" type="submit">
                                        <i class="fa-solid fa-magnifying-glass me-1"></i> ค้นหา
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Category Filter Pills -->
                        <div class="ssp-category-pills">
                            <a href="index.php?sorting=<?php echo e($sorting); ?>&view=<?php echo e($view_mode); ?>"
                               class="ssp-cat-pill <?php echo ($work_type_filter === '') ? 'active' : ''; ?>">
                                <i class="fa-solid fa-layer-group"></i> ทั้งหมด
                            </a>
                            <?php foreach ($workTypes as $typeKey => $meta): ?>
                                <a href="index.php?work_type_filter=<?php echo urlencode($typeKey); ?>&sorting=<?php echo urlencode($sorting); ?>&search_query=<?php echo urlencode($search_query); ?>&view=<?php echo urlencode($view_mode); ?>"
                                   class="ssp-cat-pill <?php echo ($work_type_filter === $typeKey) ? 'active' : ''; ?>">
                                    <i class="<?php echo e($meta['icon']); ?>"></i> <?php echo e($meta['label']); ?>
                                </a>
                            <?php endforeach; ?>
                            <?php if ($isFiltered): ?>
                                <a href="index.php" class="ssp-cat-pill bg-danger border-danger text-white ms-auto">
                                    <i class="fa-solid fa-rotate-left"></i> ล้างตัวกรอง
                                </a>
                            <?php endif; ?>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        <!-- Top Highlights Section (Inspired by SeniorStepPass Most Recommended & Most Applied) -->
        <?php if (!$isFiltered && $currentPage === 1 && (!empty($topRated) || !empty($topPopular))): ?>
            <section class="row g-4 mb-4">
                <!-- Most Recommended (Top 3 by Rating) -->
                <div class="col-lg-6">
                    <div class="ssp-highlight-card h-100">
                        <div class="ssp-highlight-header">
                            <span><i class="fa-solid fa-award text-warning me-2"></i> แนะนำสูงสุด (Most Recommended)</span>
                            <span class="badge bg-white text-dark rounded-pill">Top 3 คะแนนรีวิว</span>
                        </div>
                        <div class="p-3">
                            <?php foreach ($topRated as $idx => $item):
                                $meta = getWorkTypeMeta($item['work_type']);
                                $rank = $idx + 1;
                                $ratingVal = is_numeric($item['rating']) ? (float)$item['rating'] : 0.0;
                            ?>
                                <a href="wp-detail.php?id=<?php echo e($item['workplace_id']); ?>"
                                   class="d-flex align-items-center gap-3 p-2 rounded text-decoration-none text-dark <?php echo $idx < count($topRated) - 1 ? 'border-bottom pb-3 mb-2' : ''; ?>">
                                    <span class="ssp-rank-badge rank-<?php echo $rank; ?>">#<?php echo $rank; ?></span>
                                    <div class="flex-grow-1 min-w-0">
                                        <div class="fw-bold text-truncate"><?php echo e($item['workplace_name']); ?></div>
                                        <div class="d-flex flex-wrap align-items-center gap-2 mt-1">
                                            <span class="ssp-type-badge" style="background: <?php echo e($meta['bg']); ?>; color: <?php echo e($meta['color']); ?>;">
                                                <i class="<?php echo e($meta['icon']); ?>"></i> <?php echo e($meta['label']); ?>
                                            </span>
                                            <span class="small text-secondary">
                                                <i class="fa-solid fa-star text-warning"></i>
                                                <strong><?php echo $ratingVal > 0 ? number_format($ratingVal, 1) : '-'; ?></strong>
                                                <span class="text-muted">(<?php echo (int)$item['review_count']; ?> รีวิว)</span>
                                            </span>
                                        </div>
                                    </div>
                                    <span class="btn btn-sm btn-light rounded-pill px-3 text-secondary">
                                        ดูข้อมูล <i class="fa-solid fa-chevron-right ms-1" style="font-size: 0.7rem;"></i>
                                    </span>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>

                <!-- Most Popular (Top 3 by Student Count) -->
                <div class="col-lg-6">
                    <div class="ssp-highlight-card h-100">
                        <div class="ssp-highlight-header">
                            <span><i class="fa-solid fa-fire-flame-curved text-warning me-2"></i> ยอดนิยม (Most Selected)</span>
                            <span class="badge bg-white text-dark rounded-pill">Top 3 นักศึกษาเลือก</span>
                        </div>
                        <div class="p-3">
                            <?php foreach ($topPopular as $idx => $item):
                                $meta = getWorkTypeMeta($item['work_type']);
                                $rank = $idx + 1;
                                $ratingVal = is_numeric($item['rating']) ? (float)$item['rating'] : 0.0;
                            ?>
                                <a href="wp-detail.php?id=<?php echo e($item['workplace_id']); ?>"
                                   class="d-flex align-items-center gap-3 p-2 rounded text-decoration-none text-dark <?php echo $idx < count($topPopular) - 1 ? 'border-bottom pb-3 mb-2' : ''; ?>">
                                    <span class="ssp-rank-badge rank-<?php echo $rank; ?>">#<?php echo $rank; ?></span>
                                    <div class="flex-grow-1 min-w-0">
                                        <div class="fw-bold text-truncate"><?php echo e($item['workplace_name']); ?></div>
                                        <div class="d-flex flex-wrap align-items-center gap-2 mt-1">
                                            <span class="ssp-type-badge" style="background: <?php echo e($meta['bg']); ?>; color: <?php echo e($meta['color']); ?>;">
                                                <i class="<?php echo e($meta['icon']); ?>"></i> <?php echo e($meta['label']); ?>
                                            </span>
                                            <span class="small text-secondary">
                                                <i class="fa-solid fa-user-graduate" style="color: var(--ssp-primary);"></i>
                                                <strong><?php echo (int)$item['student_count']; ?></strong> คนเลือก
                                            </span>
                                        </div>
                                    </div>
                                    <span class="btn btn-sm btn-light rounded-pill px-3 text-secondary">
                                        ดูข้อมูล <i class="fa-solid fa-chevron-right ms-1" style="font-size: 0.7rem;"></i>
                                    </span>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </section>
        <?php endif; ?>

        <!-- Section Header & View Switcher -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <div class="d-flex align-items-center gap-2">
                <h2 class="h5 fw-bold mb-0">
                    <i class="fa-solid fa-building me-2" style="color: var(--ssp-primary);"></i>รายชื่อสถานประกอบการ
                </h2>
                <?php if ($work_type_filter !== ''): ?>
                    <span class="badge rounded-pill" style="background-color: var(--ssp-primary);"><?php echo e($work_type_filter); ?></span>
                <?php endif; ?>
                <?php if ($search_query !== ''): ?>
                    <span class="badge bg-secondary rounded-pill">ค้นหา: "<?php echo e($search_query); ?>"</span>
                <?php endif; ?>
            </div>

            <div class="btn-group btn-group-sm" role="group" aria-label="View Mode">
                <a href="?page=<?php echo $currentPage . buildQueryString(['view' => 'card']); ?>"
                   class="btn <?php echo $view_mode === 'card' ? 'btn-ssp-primary' : 'btn-outline-secondary'; ?>">
                    <i class="fa-solid fa-grip"></i> การ์ด
                </a>
                <a href="?page=<?php echo $currentPage . buildQueryString(['view' => 'table']); ?>"
                   class="btn <?php echo $view_mode === 'table' ? 'btn-ssp-primary' : 'btn-outline-secondary'; ?>">
                    <i class="fa-solid fa-table-list"></i> ตาราง
                </a>
            </div>
        </div>

        <!-- Empty State -->
        <?php if (empty($workplacesData)): ?>
            <div class="ssp-card p-5 text-center my-3">
                <div class="mb-3">
                    <span class="ssp-company-icon-lg mx-auto" style="background: rgba(220, 38, 38, 0.1); color: var(--ssp-danger);">
                        <i class="fa-solid fa-building-circle-xmark"></i>
                    </span>
                </div>
                <h3 class="h5 fw-bold text-danger">ไม่พบสถานประกอบการ!</h3>
                <p class="text-secondary mb-3">ไม่พบข้อมูลที่ตรงกับคำค้นหาหรือตัวกรองที่คุณเลือก</p>
                <a href="index.php" class="btn btn-ssp-primary rounded-pill px-4">
                    <i class="fa-solid fa-rotate-left me-1"></i> แสดงสถานประกอบการทั้งหมด
                </a>
            </div>
        <?php else: ?>

            <?php if ($view_mode === 'card'): ?>
                <!-- Modern Card Grid Layout (SeniorStepPass Style) -->
                <div class="row g-3 mb-4">
                    <?php foreach ($workplacesData as $row):
                        $meta      = getWorkTypeMeta($row['work_type']);
                        $ratingVal = is_numeric($row['rating']) ? (float)$row['rating'] : 0.0;
                    ?>
                        <div class="col-lg-6">
                            <div class="ssp-card ssp-card-hover h-100 p-3 d-flex flex-column justify-content-between">
                                <div class="d-flex gap-3">
                                    <div class="ssp-company-icon" style="background: <?php echo e($meta['bg']); ?>; color: <?php echo e($meta['color']); ?>;">
                                        <i class="<?php echo e($meta['icon']); ?>"></i>
                                    </div>
                                    <div class="flex-grow-1 min-w-0">
                                        <div class="d-flex justify-content-between align-items-start gap-2">
                                            <h3 class="h6 fw-bold mb-1 text-truncate">
                                                <a href="wp-detail.php?id=<?php echo e($row['workplace_id']); ?>" class="text-dark">
                                                    <?php echo e($row['workplace_name']); ?>
                                                </a>
                                            </h3>
                                            <span class="ssp-type-badge flex-shrink-0" style="background: <?php echo e($meta['bg']); ?>; color: <?php echo e($meta['color']); ?>;">
                                                <i class="<?php echo e($meta['icon']); ?>"></i> <?php echo e($meta['label']); ?>
                                            </span>
                                        </div>

                                        <p class="text-secondary small mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                            <?php echo e($row['description'] ?: 'ไม่มีรายละเอียดลักษณะงาน'); ?>
                                        </p>

                                        <?php if (!empty($row['workplace_address'])): ?>
                                            <div class="text-muted small text-truncate mb-2">
                                                <i class="fa-solid fa-location-dot me-1" style="color: var(--ssp-primary);"></i>
                                                <?php echo e($row['workplace_address']); ?>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>

                                <div class="d-flex flex-wrap justify-content-between align-items-center pt-2 mt-2 border-top gap-2">
                                    <div class="d-flex align-items-center gap-3">
                                        <div>
                                            <?php if ($ratingVal > 0): ?>
                                                <?php echo renderStarRating($ratingVal, 'small'); ?>
                                                <span class="fw-bold small ms-1"><?php echo number_format($ratingVal, 1); ?></span>
                                            <?php else: ?>
                                                <span class="text-muted small"><i class="fa-regular fa-star me-1"></i>ยังไม่มีคะแนน</span>
                                            <?php endif; ?>
                                        </div>
                                        <span class="text-muted small">
                                            <i class="fa-regular fa-comment-dots me-1"></i><?php echo (int)$row['review_count']; ?> รีวิว
                                        </span>
                                        <span class="text-muted small">
                                            <i class="fa-solid fa-user-graduate me-1"></i><?php echo (int)$row['student_count']; ?> คน
                                        </span>
                                    </div>

                                    <a class="btn btn-sm btn-ssp-primary rounded-pill px-3" href="wp-detail.php?id=<?php echo e($row['workplace_id']); ?>">
                                        รายละเอียด <i class="fa-solid fa-arrow-right ms-1" style="font-size: 0.75rem;"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <!-- Table View (Always rendered in table mode, and kept accessible for structured comparison) -->
            <?php if ($view_mode === 'table'): ?>
                <div class="ssp-table-wrapper mb-4">
                    <div class="table-responsive">
                        <table class="table ssp-table table-hover">
                            <thead>
                                <tr>
                                    <th class="col-3">ชื่อสถานประกอบการ</th>
                                    <th class="col-2">ประเภทงาน</th>
                                    <th class="col-4">ลักษณะงาน</th>
                                    <th class="text-center col-2">คะแนนรีวิว</th>
                                    <th class="text-center col-1">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($workplacesData as $row):
                                    $meta      = getWorkTypeMeta($row['work_type']);
                                    $ratingVal = is_numeric($row['rating']) ? (float)$row['rating'] : 0.0;
                                ?>
                                    <tr>
                                        <td class="fw-semibold">
                                            <?php echo e($row['workplace_name']); ?>
                                        </td>
                                        <td>
                                            <span class="ssp-type-badge" style="background: <?php echo e($meta['bg']); ?>; color: <?php echo e($meta['color']); ?>;">
                                                <i class="<?php echo e($meta['icon']); ?>"></i> <?php echo e($meta['label']); ?>
                                            </span>
                                        </td>
                                        <td class="text-secondary">
                                            <?php echo e($row['description']); ?>
                                        </td>
                                        <td class="text-center">
                                            <?php if ($ratingVal > 0): ?>
                                                <?php echo renderStarRating($ratingVal); ?>
                                                <div class="small text-muted"><?php echo number_format($ratingVal, 1); ?> / 5.0</div>
                                            <?php else: ?>
                                                <span class="text-muted small">ยังไม่มีคะแนน</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="text-center">
                                            <a class="btn btn-sm btn-ssp-primary rounded-pill px-3" href="wp-detail.php?id=<?php echo e($row['workplace_id']); ?>">
                                                รายละเอียด
                                            </a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?>

        <?php endif; ?>

        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
            <div class="my-4">
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center m-0">
                        <?php if ($currentPage > 1): ?>
                            <li class="page-item">
                                <a class="page-link" href="?page=<?php echo ($currentPage - 1) . buildQueryString(); ?>" aria-label="Previous">
                                    <i class="fa-solid fa-chevron-left"></i>
                                </a>
                            </li>
                        <?php endif; ?>

                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <li class="page-item <?php echo ($i === $currentPage) ? 'active' : ''; ?>">
                                <a class="page-link" href="?page=<?php echo $i . buildQueryString(); ?>">
                                    <?php echo $i; ?>
                                </a>
                            </li>
                        <?php endfor; ?>

                        <?php if ($currentPage < $totalPages): ?>
                            <li class="page-item">
                                <a class="page-link" href="?page=<?php echo ($currentPage + 1) . buildQueryString(); ?>" aria-label="Next">
                                    <i class="fa-solid fa-chevron-right"></i>
                                </a>
                            </li>
                        <?php endif; ?>
                    </ul>
                </nav>
            </div>
        <?php endif; ?>
    </main>

    <?php include 'script.php'; ?>
    <script>
        addClassToElement("index");
    </script>
</body>
</html>
