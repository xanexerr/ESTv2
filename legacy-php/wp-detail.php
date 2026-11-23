<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include "header.php"; ?>
<body>
    <?php include "navbar.php"; ?>

    <?php
    $workplace_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    $stmt = $conn->prepare("
        SELECT w.*,
               (SELECT COUNT(*) FROM users u WHERE u.workplace_id = w.workplace_id) AS student_count
        FROM workplaces w
        WHERE w.workplace_id = :wid
        LIMIT 1
    ");
    $stmt->execute([':wid' => $workplace_id]);
    $workplacesData = $stmt->fetchAll();

    // Fetch visible comments with reviewer profile information
    $stmtComments = $conn->prepare("
        SELECT c.*, u.user_fname, u.user_lname, u.role
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.user_id
        WHERE c.workplace_id = :wid AND c.`show` = 1
        ORDER BY c.comment_time DESC
    ");
    $stmtComments->execute([':wid' => $workplace_id]);
    $commentsList = $stmtComments->fetchAll();

    // Collect valid images from comments
    $images = [];
    foreach ($commentsList as $cRow) {
        $normImg = normalizeCommentImagePath($cRow['img'] ?? null);
        if ($normImg !== null) {
            $images[] = $normImg;
        }
    }

    // Check current logged-in student's selected workplace
    $currentUserWorkplaceId = null;
    if (isset($_SESSION['user_id'])) {
        $stmtUserWp = $conn->prepare("SELECT workplace_id FROM users WHERE user_id = :uid LIMIT 1");
        $stmtUserWp->execute([':uid' => $_SESSION['user_id']]);
        $uWpRow = $stmtUserWp->fetch();
        if ($uWpRow) {
            $currentUserWorkplaceId = $uWpRow['workplace_id'];
        }
    }
    ?>

    <main class="container my-4 flex-grow-1">
        <div class="mb-3">
            <a href="index.php" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
                <i class="fa-solid fa-arrow-left me-1"></i> กลับหน้ารายชื่อสถานประกอบการ
            </a>
        </div>

        <?php if (empty($workplacesData)): ?>
            <div class="ssp-card p-5 text-center">
                <i class="fa-solid fa-circle-exclamation text-danger fs-1 mb-3"></i>
                <h2 class="h5 fw-bold">ไม่พบข้อมูลสถานประกอบการ</h2>
                <p class="text-secondary">สถานประกอบการนี้อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
                <a href="index.php" class="btn btn-ssp-primary rounded-pill px-4">กลับหน้าแรก</a>
            </div>
        <?php else: ?>
            <?php foreach ($workplacesData as $row):
                $meta      = getWorkTypeMeta($row['work_type']);
                $ratingVal = is_numeric($row['rating']) ? (float)$row['rating'] : 0.0;
                $mapUrl    = trim((string)($row['map'] ?? ''));
                if ($mapUrl !== '' && !preg_match('#^https?://#i', $mapUrl)) {
                    $mapUrl = 'https://' . $mapUrl;
                }
            ?>
                <div class="row g-4">
                    <!-- Left / Main Column: Company Profile & Action -->
                    <div class="col-lg-8">
                        <div class="ssp-card p-4 mb-4">
                            <div class="d-flex flex-wrap align-items-start gap-3 pb-3 border-bottom">
                                <div class="ssp-company-icon-lg" style="background: <?php echo e($meta['bg']); ?>; color: <?php echo e($meta['color']); ?>;">
                                    <i class="<?php echo e($meta['icon']); ?>"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                                        <a href="index.php?work_type_filter=<?php echo urlencode($row['work_type']); ?>&sorting=newest&search_query="
                                           class="ssp-type-badge text-decoration-none"
                                           style="background: <?php echo e($meta['bg']); ?>; color: <?php echo e($meta['color']); ?>;">
                                            <i class="<?php echo e($meta['icon']); ?>"></i> ประเภทงาน : <?php echo e($meta['label']); ?>
                                        </a>
                                        <span class="badge bg-light text-secondary border rounded-pill">
                                            <i class="fa-solid fa-user-graduate me-1" style="color: var(--ssp-primary);"></i>
                                            นักศึกษาเลือกแล้ว <?php echo (int)$row['student_count']; ?> คน
                                        </span>
                                    </div>
                                    <h1 class="h3 fw-bold mb-1"><?php echo e($row['workplace_name']); ?></h1>
                                </div>
                            </div>

                            <!-- Company Details -->
                            <div class="row g-3 mt-2">
                                <div class="col-12">
                                    <div class="p-3 rounded" style="background-color: #F8FAFC; border: 1px solid var(--ssp-border);">
                                        <div class="small fw-semibold text-secondary mb-1">
                                            <i class="fa-solid fa-briefcase me-1" style="color: var(--ssp-primary);"></i> ลักษณะงาน (Job Description)
                                        </div>
                                        <p class="mb-0 text-dark" style="line-height: 1.6;">
                                            <?php echo nl2br(e($row['description'] ?: 'ไม่ได้ระบุรายละเอียด')); ?>
                                        </p>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="p-3 rounded h-100" style="background-color: #F8FAFC; border: 1px solid var(--ssp-border);">
                                        <div class="small fw-semibold text-secondary mb-1">
                                            <i class="fa-solid fa-phone me-1" style="color: var(--ssp-primary);"></i> เบอร์โทรติดต่อ
                                        </div>
                                        <div class="fw-semibold fs-6">
                                            <?php echo e($row['work_tel'] ?: '-'); ?>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="p-3 rounded h-100 d-flex flex-column justify-content-between" style="background-color: #F8FAFC; border: 1px solid var(--ssp-border);">
                                        <div class="small fw-semibold text-secondary mb-1">
                                            <i class="fa-solid fa-map-location-dot me-1" style="color: var(--ssp-primary);"></i> พิกัดแผนที่
                                        </div>
                                        <div>
                                            <?php if ($mapUrl !== ''): ?>
                                                <a class="btn btn-sm btn-ssp-primary rounded-pill px-3" href="<?php echo e($mapUrl); ?>" target="_blank" rel="noopener">
                                                    <i class="fa-solid fa-location-arrow me-1"></i> ดูแผนที่สถานประกอบการ
                                                </a>
                                            <?php else: ?>
                                                <span class="text-muted small">ไม่ได้ระบุลิงก์แผนที่</span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12">
                                    <div class="p-3 rounded" style="background-color: #F8FAFC; border: 1px solid var(--ssp-border);">
                                        <div class="small fw-semibold text-secondary mb-1">
                                            <i class="fa-solid fa-location-dot me-1" style="color: var(--ssp-primary);"></i> ที่อยู่สถานประกอบการ
                                        </div>
                                        <p class="mb-0 text-dark">
                                            <?php echo nl2br(e($row['workplace_address'] ?: '-')); ?>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Student Select Workplace Action (Inspired by SeniorStepPass Select Internship button) -->
                            <?php if (isset($_SESSION['user_id']) && ($_SESSION['role'] ?? '') === 'student'): ?>
                                <div class="mt-4 pt-3 border-top">
                                    <?php if ($currentUserWorkplaceId === null || $currentUserWorkplaceId === ''): ?>
                                        <form name="select_workplace_form" method="POST" action="php/update-wp-select.php" enctype="multipart/form-data">
                                            <input type="hidden" name="workplace" value="<?php echo e($workplace_id); ?>">
                                            <button type="submit" value="submit" class="btn btn-success btn-lg w-100 fw-semibold shadow-sm">
                                                <i class="fa-solid fa-circle-check me-2"></i>
                                                เลือก <?php echo e($row["workplace_name"]); ?> เป็นสถานประกอบการของฉัน
                                            </button>
                                        </form>
                                    <?php elseif ((int)$currentUserWorkplaceId === (int)$workplace_id): ?>
                                        <div class="alert alert-success d-flex align-items-center justify-content-between mb-0">
                                            <div>
                                                <i class="fa-solid fa-circle-check me-2"></i>
                                                <strong>สถานประกอบการปัจจุบันของคุณ</strong>
                                            </div>
                                            <a href="std-wp-edit.php" class="btn btn-sm btn-success rounded-pill px-3">
                                                จัดการข้อมูล / รีวิว
                                            </a>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- Reviews & Feedback List (SeniorStepPass Feedback Card Style) -->
                        <div class="ssp-card p-4">
                            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                <h2 class="h5 fw-bold mb-0">
                                    <i class="fa-solid fa-comments me-2" style="color: var(--ssp-primary);"></i>
                                    ความคิดเห็นและรีวิวจากรุ่นพี่ (<?php echo count($commentsList); ?>)
                                </h2>
                            </div>

                            <?php if (empty($commentsList)): ?>
                                <div class="text-center py-4 text-secondary">
                                    <i class="fa-regular fa-comment-dots fs-2 mb-2 opacity-50"></i>
                                    <p class="mb-0">ยังไม่มีความคิดเห็นต่อสถานประกอบการนี้</p>
                                </div>
                            <?php else: ?>
                                <div class="d-flex flex-column gap-3" style="max-height: 600px; overflow-y: auto;">
                                    <?php foreach ($commentsList as $idx => $comment):
                                        $reviewerName = trim(($comment['user_fname'] ?? '') . ' ' . ($comment['user_lname'] ?? ''));
                                        if ($reviewerName === '') {
                                            $reviewerName = 'นักศึกษาฝึกงาน #' . ($idx + 1);
                                        }
                                        $initial = mb_substr($reviewerName, 0, 1, 'UTF-8');
                                        $cRating = is_numeric($comment['rating']) ? (float)$comment['rating'] : 0.0;
                                        $cImg    = normalizeCommentImagePath($comment['img'] ?? null);
                                    ?>
                                        <div class="p-3 rounded" style="background-color: #F8FAFC; border: 1px solid var(--ssp-border);">
                                            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                                                <div class="d-flex align-items-center gap-2">
                                                    <span class="ssp-user-avatar" style="background: var(--ssp-primary); color: #fff;">
                                                        <?php echo e($initial); ?>
                                                    </span>
                                                    <div>
                                                        <div class="fw-bold small"><?php echo e($reviewerName); ?></div>
                                                        <div class="text-muted" style="font-size: 0.75rem;">
                                                            ความคิดเห็นที่ <?php echo $idx + 1; ?>
                                                            <?php if (!empty($comment['comment_time'])): ?>
                                                                &bull; <?php echo e($comment['comment_time']); ?>
                                                            <?php endif; ?>
                                                        </div>
                                                    </div>
                                                </div>
                                                <?php if ($cRating > 0): ?>
                                                    <div>
                                                        <?php echo renderStarRating($cRating, 'small'); ?>
                                                    </div>
                                                <?php endif; ?>
                                            </div>

                                            <?php if (!empty($comment['comment_text'])): ?>
                                                <p class="mb-2 text-dark" style="font-size: 0.93rem;">
                                                    <?php echo nl2br(e($comment['comment_text'])); ?>
                                                </p>
                                            <?php endif; ?>

                                            <?php if ($cImg !== null): ?>
                                                <div class="mt-2">
                                                    <img src="<?php echo e($cImg); ?>" alt="Review Image"
                                                         style="width: 110px; height: 110px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 1px solid var(--ssp-border);"
                                                         onclick="openModal('<?php echo e($cImg); ?>')"
                                                         onerror="this.style.display='none'">
                                                </div>
                                            <?php endif; ?>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Right Column: Overall Rating Summary & Photo Gallery -->
                    <div class="col-lg-4">
                        <!-- Rating Summary Card -->
                        <div class="ssp-card p-4 mb-4 text-center">
                            <h2 class="h6 fw-bold text-secondary text-uppercase mb-3">คะแนนรีวิวเฉลี่ย</h2>
                            <?php if ($ratingVal > 0): ?>
                                <div class="display-4 fw-bold mb-1" style="color: var(--ssp-primary);">
                                    <?php echo number_format($ratingVal, 1); ?><span class="fs-4 text-muted">/5</span>
                                </div>
                                <div class="fs-4 mb-2">
                                    <?php echo renderStarRating($ratingVal); ?>
                                </div>
                                <div class="text-secondary small">
                                    จากทั้งหมด <?php echo count($commentsList); ?> ความคิดเห็น
                                </div>
                            <?php else: ?>
                                <div class="py-3">
                                    <div class="fs-1 text-muted mb-2"><i class="fa-regular fa-star"></i></div>
                                    <div class="fw-semibold text-dark">ยังไม่มีคะแนน</div>
                                    <div class="small text-secondary">ยังไม่มีความคิดเห็นต่อสถานประกอบการ</div>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- Gallery from Previous Interns -->
                        <div class="ssp-card p-4">
                            <h2 class="h6 fw-bold mb-3">
                                <i class="fa-solid fa-images me-2" style="color: var(--ssp-primary);"></i>
                                ภาพจากรุ่นก่อน
                            </h2>
                            <?php if (!empty($images)): ?>
                                <div class="image-gallery">
                                    <?php foreach ($images as $image): ?>
                                        <img src="<?php echo e($image); ?>" alt="Workplace Image" class="gallery-image"
                                             onclick="openModal('<?php echo e($image); ?>')"
                                             onerror="this.style.display='none'">
                                    <?php endforeach; ?>
                                </div>
                            <?php else: ?>
                                <div class="text-center py-4 text-muted small">
                                    <i class="fa-regular fa-image fs-3 d-block mb-2 opacity-50"></i>
                                    ยังไม่มีรูปภาพที่อัปโหลดสำหรับสถานประกอบการนี้
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </main>

    <!-- Lightbox Modal -->
    <div class="ssp-lightbox" id="myModal" onclick="closeModal(event)">
        <div class="ssp-lightbox-content">
            <img class="ssp-lightbox-img" id="modalImage" alt="Full Image">
            <div class="mt-3">
                <button type="button" class="btn btn-light rounded-pill px-4 fw-semibold" onclick="document.getElementById('myModal').style.display='none'">
                    <i class="fa-solid fa-xmark me-1"></i> ปิดรูปภาพ
                </button>
            </div>
        </div>
    </div>

    <script>
        function openModal(imageSrc) {
            var modal = document.getElementById('myModal');
            var modalImage = document.getElementById('modalImage');
            modalImage.src = imageSrc;
            modal.style.display = 'flex';
        }

        function closeModal(event) {
            var modal = document.getElementById('myModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    </script>

    <?php include 'script.php'; ?>
</body>
</html>
