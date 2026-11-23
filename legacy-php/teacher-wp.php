<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include 'header.php'; ?>
<body>
    <?php
    include 'navbar.php';

    if (!isset($_SESSION['user_id'])) {
        echo '<script>
            Swal.fire({
                title: "คุณยังไม่ได้เข้าสู่ระบบ",
                icon: "warning",
                confirmButtonText: "ตกลง"
            }).then(() => {
                window.location.href = "login.php";
            });
        </script>';
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $limit   = 12;

    $stmt = $conn->prepare("SELECT COUNT(*) FROM workplaces WHERE user_id = :uid");
    $stmt->execute([':uid' => $user_id]);
    $totalWorkplaces = (int)$stmt->fetchColumn();
    $totalRows       = $totalWorkplaces;
    $totalPages      = max(1, (int)ceil($totalRows / $limit));
    $currentPage     = isset($_GET['page']) && is_numeric($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $offset          = ($currentPage - 1) * $limit;

    $stmt = $conn->prepare("SELECT * FROM workplaces WHERE user_id = :uid ORDER BY workplace_id DESC LIMIT :limit OFFSET :offset");
    $stmt->bindValue(':uid', $user_id, PDO::PARAM_STR);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $workplacesData = $stmt->fetchAll();
    ?>

    <main class="container my-4 flex-grow-1">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <div>
                <h1 class="h4 fw-bold mb-1">
                    <i class="fa-solid fa-briefcase me-2" style="color: var(--ssp-primary);"></i>จัดการสถานประกอบการของฉัน
                </h1>
                <p class="text-secondary small mb-0">รายการสถานประกอบการที่คุณเป็นผู้เพิ่มเข้าสู่ระบบทั้งหมด <?php echo number_format($totalWorkplaces); ?> แห่ง</p>
            </div>
            <a href="teacher-add-form.php" class="btn btn-ssp-primary rounded-pill px-4 fw-semibold">
                <i class="fa-solid fa-circle-plus me-1"></i> เพิ่มสถานประกอบการ
            </a>
        </div>

        <div class="ssp-table-wrapper">
            <div class="table-responsive">
                <?php if ($totalWorkplaces > 0): ?>
                    <table class="table ssp-table table-hover">
                        <thead>
                            <tr>
                                <th class="text-center col-1">#</th>
                                <th class="col-3">ชื่อสถานประกอบการ</th>
                                <th class="text-center col-2">ประเภทงาน</th>
                                <th class="col-4">รายละเอียด</th>
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
                                        <div class="d-inline-flex gap-1">
                                            <a class="btn btn-sm btn-outline-primary rounded-pill px-3"
                                               href="wp-detail.php?id=<?php echo e($row['workplace_id']); ?>">
                                                รายละเอียด
                                            </a>
                                            <a href="teacher-wp-edit.php?id=<?php echo e($row['workplace_id']); ?>"
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
                    <div class="p-5 text-center text-secondary">
                        <i class="fa-solid fa-building-circle-exclamation fs-1 mb-2 opacity-50"></i>
                        <p class="mb-3">ยังไม่มีข้อมูลสถานประกอบการที่คุณเพิ่มไว้</p>
                        <a href="teacher-add-form.php" class="btn btn-ssp-primary rounded-pill px-4">เพิ่มสถานประกอบการแห่งแรก</a>
                    </div>
                <?php endif; ?>
            </div>
        </div>

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

    <?php include 'script.php'; ?>
    <script>
        addClassToElement("tmanage");
    </script>
</body>
</html>
