<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include 'header.php'; ?>
<body>
    <?php include 'navbar.php'; ?>

    <?php
    $user_id = $_SESSION['user_id'] ?? '';
    $stmtUserWp = $conn->prepare("SELECT workplace_id FROM users WHERE user_id = :uid LIMIT 1");
    $stmtUserWp->execute([':uid' => $user_id]);
    $wpresult = $stmtUserWp->fetch();
    $workplace_id = $wpresult ? trim((string)$wpresult["workplace_id"]) : '';

    $stmtComment = $conn->prepare("SELECT * FROM comments WHERE user_id = :uid LIMIT 1");
    $stmtComment->execute([':uid' => $user_id]);
    $com = $stmtComment->fetch();
    $comrate = $com ? $com["rating"] : 5;
    $comtext = $com ? $com["comment_text"] : '';
    $u_image = $com ? ($com["img"] ?? '') : '';
    $normImage = normalizeCommentImagePath($u_image);
    ?>

    <main class="container my-4 flex-grow-1">
        <div class="mx-auto" style="max-width: 600px;">
            <div class="ssp-card overflow-hidden">
                <div class="p-4 text-white" style="background: linear-gradient(135deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                    <h1 class="h5 fw-bold mb-1"><i class="fa-solid fa-pen-to-square me-2"></i>แก้ไขความคิดเห็นของคุณ</h1>
                    <p class="small opacity-75 mb-0">ปรับปรุงข้อความรีวิวหรืออัปเดตรูปภาพประกอบการฝึกงาน</p>
                </div>

                <div class="p-4">
                    <form action="php/updatecm.php" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="workplace_id" readonly value="<?php echo e($workplace_id); ?>">
                        <input type="hidden" name="old_img" value="<?php echo e($u_image); ?>">

                        <div class="mb-3">
                            <label for="comment" class="form-label fw-semibold small">ความคิดเห็น :</label>
                            <textarea maxlength="250" class="form-control" name="comment" id="comment" rows="4"
                                required><?php echo e($comtext); ?></textarea>
                        </div>

                        <?php if ($normImage !== null): ?>
                            <div class="mb-3">
                                <label class="form-label fw-semibold small d-block">รูปภาพปัจจุบัน :</label>
                                <img src="<?php echo e($normImage); ?>" alt="Current Image" class="rounded border"
                                     style="max-height: 140px; object-fit: cover;" onerror="this.style.display='none'">
                            </div>
                        <?php endif; ?>

                        <div class="mb-4">
                            <label for="imgInput" class="form-label fw-semibold small">เปลี่ยนรูปภาพใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</label>
                            <input type="file" class="form-control" id="imgInput" name="img" accept="image/png,image/jpeg,image/jpg" onchange="previewImage(event)">
                            <img id="imgPreview" alt="Preview Image" class="mt-2 rounded border"
                                style="max-width: 100%; max-height: 220px; display: none; object-fit: cover;">
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" name="submit" class="btn btn-ssp-primary py-2 fw-semibold">
                                <i class="fa-solid fa-floppy-disk me-1"></i> บันทึกการแก้ไขความคิดเห็น
                            </button>
                            <a href="std-wp-edit.php" class="btn btn-outline-secondary py-2">ยกเลิก</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>

    <?php include 'script.php'; ?>
    <script>
        function previewImage(event) {
            const input = event.target;
            const preview = document.getElementById('imgPreview');
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(input.files[0]);
            } else {
                preview.src = '';
                preview.style.display = 'none';
            }
        }
    </script>
</body>
</html>
