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

    $totalcomment   = (int)$conn->query("SELECT COUNT(*) FROM comments")->fetchColumn();
    $visibleComment = (int)$conn->query("SELECT COUNT(*) FROM comments WHERE `show` = 1")->fetchColumn();
    $hiddenComment  = $totalcomment - $visibleComment;

    $limit       = 12;
    $totalRows   = $totalcomment;
    $totalPages  = max(1, (int)ceil($totalRows / $limit));
    $currentPage = isset($_GET['page']) && is_numeric($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $offset      = ($currentPage - 1) * $limit;

    $stmt = $conn->prepare("
        SELECT c.*, w.workplace_name
        FROM comments c
        LEFT JOIN workplaces w ON c.workplace_id = w.workplace_id
        ORDER BY c.comment_time DESC
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $commentData = $stmt->fetchAll();
    ?>

    <main class="container my-4 flex-grow-1">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <div>
                <h1 class="h4 fw-bold mb-1">
                    <i class="fa-solid fa-comments me-2" style="color: var(--ssp-primary);"></i>ระบบจัดการความคิดเห็น (Review Moderation)
                </h1>
                <p class="text-secondary small mb-0">ตรวจสอบและควบคุมการแสดงผลความคิดเห็นของนักศึกษา</p>
            </div>
        </div>

        <!-- Summary Stats -->
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="ssp-stat-card">
                    <div class="ssp-stat-icon" style="background: var(--ssp-primary-light); color: var(--ssp-primary);">
                        <i class="fa-solid fa-comments"></i>
                    </div>
                    <div>
                        <div class="text-secondary small">ความคิดเห็นทั้งหมด</div>
                        <div class="h4 fw-bold mb-0"><?php echo number_format($totalcomment); ?></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="ssp-stat-card">
                    <div class="ssp-stat-icon" style="background: rgba(22, 163, 74, 0.12); color: #16A34A;">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                        <div class="text-secondary small">แสดงผลอยู่</div>
                        <div class="h4 fw-bold mb-0"><?php echo number_format($visibleComment); ?></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="ssp-stat-card">
                    <div class="ssp-stat-icon" style="background: rgba(220, 38, 38, 0.12); color: #DC2626;">
                        <i class="fa-solid fa-eye-slash"></i>
                    </div>
                    <div>
                        <div class="text-secondary small">ซ่อนอยู่</div>
                        <div class="h4 fw-bold mb-0"><?php echo number_format($hiddenComment); ?></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="ssp-table-wrapper">
            <div class="table-responsive">
                <?php if ($totalcomment > 0): ?>
                    <table class="table ssp-table table-hover">
                        <thead>
                            <tr>
                                <th class="col-2">รหัสนักศึกษา</th>
                                <th class="col-2">สถานประกอบการ</th>
                                <th class="col-4">ความคิดเห็น</th>
                                <th class="text-center col-2">เวลาแสดงความคิดเห็น</th>
                                <th class="text-center col-1">สถานะ</th>
                                <th class="text-center col-1">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($commentData as $row): ?>
                                <tr>
                                    <td class="fw-semibold"><?php echo e($row['user_id']); ?></td>
                                    <td>
                                        <a href="wp-detail.php?id=<?php echo e($row['workplace_id']); ?>" class="text-dark fw-medium">
                                            #<?php echo e($row['workplace_id']); ?> <?php echo e($row['workplace_name'] ?? ''); ?>
                                        </a>
                                    </td>
                                    <td><?php echo e($row['comment_text']); ?></td>
                                    <td class="text-center small text-secondary"><?php echo e($row['comment_time']); ?></td>
                                    <td class="text-center">
                                        <?php if ((int)$row['show'] === 1): ?>
                                            <span class="ssp-status-badge status-active">แสดง</span>
                                        <?php else: ?>
                                            <span class="ssp-status-badge status-hidden">ไม่แสดง</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-center">
                                        <a href="php/show-status.php?comment_id=<?php echo e($row['comment_id']); ?>"
                                           class="btn btn-sm btn-ssp-amber rounded-pill px-3">
                                            แก้ไขสถานะ
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <div class="p-5 text-center text-secondary">ยังไม่มีข้อมูลความคิดเห็น</div>
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
                                <a class="page-link" href="?page=<?php echo ($currentPage - 1); ?>">
                                    <i class="fa-solid fa-chevron-left"></i>
                                </a>
                            </li>
                        <?php endif; ?>
                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <li class="page-item <?php echo ($i === $currentPage) ? 'active' : ''; ?>">
                                <a class="page-link" href="?page=<?php echo $i; ?>"><?php echo $i; ?></a>
                            </li>
                        <?php endfor; ?>
                        <?php if ($currentPage < $totalPages): ?>
                            <li class="page-item">
                                <a class="page-link" href="?page=<?php echo ($currentPage + 1); ?>">
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
        addClassToElement("cmtmanage");
    </script>
</body>
</html>
