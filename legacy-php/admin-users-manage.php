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

    // Dashboard stats
    $totalusers    = (int)$conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $studentCount  = (int)$conn->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
    $teacherCount  = (int)$conn->query("SELECT COUNT(*) FROM users WHERE role = 'teacher'")->fetchColumn();
    $adminCount    = (int)$conn->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();

    $limit = 12;
    $search_query = isset($_GET['search_query']) ? trim($_GET['search_query']) : '';
    $currentPage  = isset($_GET['page']) && is_numeric($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $offset       = ($currentPage - 1) * $limit;

    $order = "ORDER BY user_id DESC";
    if (isset($_GET['work_type_filter'])) {
        $wf = $_GET['work_type_filter'];
        if ($wf === 'ASC') {
            $order = "ORDER BY user_id ASC";
        } elseif ($wf === 'username_ASC') {
            $order = "ORDER BY username ASC";
        } elseif ($wf === 'username_DESC') {
            $order = "ORDER BY username DESC";
        }
    }

    if ($search_query !== '') {
        $search = '%' . $search_query . '%';
        $countStmt = $conn->prepare("
            SELECT COUNT(*) FROM users
            WHERE user_id LIKE :sq OR username LIKE :sq OR user_fname LIKE :sq OR user_lname LIKE :sq OR role LIKE :sq
        ");
        $countStmt->bindValue(':sq', $search, PDO::PARAM_STR);
        $countStmt->execute();
        $totalRows = (int)$countStmt->fetchColumn();

        $stmt = $conn->prepare("
            SELECT * FROM users
            WHERE user_id LIKE :sq OR username LIKE :sq OR user_fname LIKE :sq OR user_lname LIKE :sq OR role LIKE :sq
            $order
            LIMIT :limit OFFSET :offset
        ");
        $stmt->bindValue(':sq', $search, PDO::PARAM_STR);
    } else {
        $totalRows = $totalusers;
        $stmt = $conn->prepare("SELECT * FROM users $order LIMIT :limit OFFSET :offset");
    }

    $totalPages = max(1, (int)ceil($totalRows / $limit));
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $usersData = $stmt->fetchAll();
    ?>

    <main class="container my-4 flex-grow-1">
        <!-- Page Title & Action -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <div>
                <h1 class="h4 fw-bold mb-1"><i class="fa-solid fa-users-gear me-2" style="color: var(--ssp-primary);"></i>ข้อมูลผู้ใช้ทั้งหมด (User Management)</h1>
                <p class="text-secondary small mb-0">จัดการบัญชีผู้ใช้งาน นักเรียน ครู และผู้ดูแลระบบ</p>
            </div>
            <a href="add-member.php" class="btn btn-ssp-primary rounded-pill px-4 fw-semibold">
                <i class="fa-solid fa-user-plus me-1"></i> เพิ่มบัญชีผู้ใช้
            </a>
        </div>

        <!-- Summary Stats Row -->
        <div class="row g-3 mb-4">
            <div class="col-md-3 col-6">
                <div class="ssp-stat-card">
                    <div class="ssp-stat-icon" style="background: var(--ssp-primary-light); color: var(--ssp-primary);">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div>
                        <div class="text-secondary small">บัญชีทั้งหมด</div>
                        <div class="h4 fw-bold mb-0"><?php echo number_format($totalusers); ?></div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="ssp-stat-card">
                    <div class="ssp-stat-icon" style="background: rgba(37, 99, 235, 0.12); color: #2563EB;">
                        <i class="fa-solid fa-user-graduate"></i>
                    </div>
                    <div>
                        <div class="text-secondary small">นักเรียน / นักศึกษา</div>
                        <div class="h4 fw-bold mb-0"><?php echo number_format($studentCount); ?></div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="ssp-stat-card">
                    <div class="ssp-stat-icon" style="background: rgba(245, 158, 11, 0.14); color: #D97706;">
                        <i class="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <div>
                        <div class="text-secondary small">ครู / อาจารย์</div>
                        <div class="h4 fw-bold mb-0"><?php echo number_format($teacherCount); ?></div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="ssp-stat-card">
                    <div class="ssp-stat-icon" style="background: rgba(22, 163, 74, 0.12); color: #16A34A;">
                        <i class="fa-solid fa-user-shield"></i>
                    </div>
                    <div>
                        <div class="text-secondary small">ผู้ดูแลระบบ</div>
                        <div class="h4 fw-bold mb-0"><?php echo number_format($adminCount); ?></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Bar -->
        <div class="ssp-card p-3 mb-4">
            <form method="GET" action="admin-users-manage.php" class="row g-2 align-items-center">
                <div class="col-md-10">
                    <div class="input-group">
                        <span class="input-group-text bg-light border-end-0"><i class="fa-solid fa-magnifying-glass text-secondary"></i></span>
                        <input type="text" class="form-control border-start-0" placeholder="ค้นหารหัสผู้ใช้, ชื่อผู้ใช้, ชื่อ-นามสกุล หรือสถานะ..."
                            name="search_query" value="<?php echo e($search_query); ?>">
                    </div>
                </div>
                <div class="col-md-2 d-grid">
                    <button class="btn btn-ssp-primary" type="submit">
                        <i class="fa-solid fa-magnifying-glass me-1"></i> ค้นหา
                    </button>
                </div>
            </form>
        </div>

        <!-- Users Table -->
        <div class="ssp-table-wrapper">
            <div class="table-responsive">
                <?php if ($totalRows > 0): ?>
                    <table class="table ssp-table table-hover">
                        <thead>
                            <tr>
                                <th>รหัสผู้ใช้</th>
                                <th>ชื่อผู้ใช้</th>
                                <th>ชื่อ</th>
                                <th>นามสกุล</th>
                                <th class="text-center">สถานะ</th>
                                <th class="text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($usersData as $row): ?>
                                <tr>
                                    <td class="fw-semibold"><?php echo e($row['user_id']); ?></td>
                                    <td><?php echo e($row['username']); ?></td>
                                    <td><?php echo e($row['user_fname']); ?></td>
                                    <td><?php echo e($row['user_lname']); ?></td>
                                    <td class="text-center">
                                        <?php if ($row['role'] === 'student'): ?>
                                            <span class="badge rounded-pill" style="background: rgba(37, 99, 235, 0.12); color: #2563EB;">นักเรียน นักศึกษา</span>
                                        <?php elseif ($row['role'] === 'admin'): ?>
                                            <span class="badge rounded-pill" style="background: rgba(22, 163, 74, 0.12); color: #16A34A;">ผู้ดูแลระบบ</span>
                                        <?php elseif ($row['role'] === 'teacher'): ?>
                                            <span class="badge rounded-pill" style="background: rgba(245, 158, 11, 0.15); color: #D97706;">ครู</span>
                                        <?php else: ?>
                                            <span class="badge bg-secondary rounded-pill"><?php echo e($row['role']); ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-center">
                                        <a href="admin-users.php?id=<?php echo urlencode($row['user_id']); ?>"
                                           class="btn btn-sm btn-ssp-amber rounded-pill px-3">
                                            <i class="fa-solid fa-pen-to-square me-1"></i> แก้ไขข้อมูล
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <div class="p-5 text-center text-secondary">ไม่พบข้อมูลผู้ใช้งาน</div>
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
                                <a class="page-link" href="?page=<?php echo ($currentPage - 1) . ($search_query !== '' ? '&search_query=' . urlencode($search_query) : ''); ?>">
                                    <i class="fa-solid fa-chevron-left"></i>
                                </a>
                            </li>
                        <?php endif; ?>
                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <li class="page-item <?php echo ($i === $currentPage) ? 'active' : ''; ?>">
                                <a class="page-link" href="?page=<?php echo $i . ($search_query !== '' ? '&search_query=' . urlencode($search_query) : ''); ?>">
                                    <?php echo $i; ?>
                                </a>
                            </li>
                        <?php endfor; ?>
                        <?php if ($currentPage < $totalPages): ?>
                            <li class="page-item">
                                <a class="page-link" href="?page=<?php echo ($currentPage + 1) . ($search_query !== '' ? '&search_query=' . urlencode($search_query) : ''); ?>">
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
        addClassToElement("amanage");
    </script>
</body>
</html>
