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
    ?>

    <main class="container my-4 flex-grow-1">
        <div class="mx-auto" style="max-width: 600px;">
            <div class="ssp-card overflow-hidden">
                <div class="p-4 text-white" style="background: linear-gradient(135deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                    <h1 class="h5 fw-bold mb-1"><i class="fa-solid fa-star me-2 text-warning"></i>แสดงความคิดเห็นและให้คะแนนรีวิว</h1>
                    <p class="small opacity-75 mb-0">แบ่งปันประสบการณ์ฝึกงานของคุณเพื่อเป็นข้อมูลให้รุ่นน้อง</p>
                </div>

                <div class="p-4">
                    <form action="php/insertcm.php" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="workplace_id" readonly value="<?php echo e($workplace_id); ?>">

                        <div class="mb-3">
                            <label class="form-label fw-semibold small d-block">ให้คะแนนสถานประกอบการ (1 - 5 ดาว)</label>
                            <div class="p-3 rounded bg-light d-flex align-items-center justify-content-between">
                                <div class="star-widget">
                                    <input type="radio" name="rate" id="rate-5" value="5" checked>
                                    <label for="rate-5" class="fas fa-star" title="5 ดาว"></label>
                                    <input type="radio" name="rate" id="rate-4" value="4">
                                    <label for="rate-4" class="fas fa-star" title="4 ดาว"></label>
                                    <input type="radio" name="rate" id="rate-3" value="3">
                                    <label for="rate-3" class="fas fa-star" title="3 ดาว"></label>
                                    <input type="radio" name="rate" id="rate-2" value="2">
                                    <label for="rate-2" class="fas fa-star" title="2 ดาว"></label>
                                    <input type="radio" name="rate" id="rate-1" value="1">
                                    <label for="rate-1" class="fas fa-star" title="1 ดาว"></label>
                                </div>
                                <span class="badge rounded-pill bg-warning text-dark px-3 py-2" id="ratingLabel">5 ดาว</span>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="comment" class="form-label fw-semibold small">ความคิดเห็น / รีวิวการฝึกงาน :</label>
                            <textarea class="form-control" name="comment" id="comment" rows="4" maxlength="250"
                                placeholder="เล่าบรรยากาศการทำงาน พี่เลี้ยง หรือสิ่งที่ได้เรียนรู้ (สูงสุด 250 ตัวอักษร)" required></textarea>
                        </div>

                        <div class="mb-4">
                            <label for="imgInput" class="form-label fw-semibold small">เพิ่มรูปภาพบรรยากาศฝึกงาน (ไม่บังคับ)</label>
                            <input type="file" class="form-control" id="imgInput" name="img" accept="image/png,image/jpeg,image/jpg">
                            <img id="previewImg" alt="Preview" class="mt-2 rounded border" style="max-width: 100%; max-height: 220px; display: none; object-fit: cover;">
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" name="submit" class="btn btn-ssp-primary py-2 fw-semibold">
                                <i class="fa-solid fa-paper-plane me-1"></i> ยืนยันการส่งความคิดเห็น
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
        document.querySelectorAll('.star-widget input').forEach(function (radio) {
            radio.addEventListener('change', function () {
                document.getElementById('ratingLabel').textContent = this.value + ' ดาว';
            });
        });

        const imgInput = document.getElementById('imgInput');
        const previewImg = document.getElementById('previewImg');
        if (imgInput) {
            imgInput.addEventListener('change', function () {
                const [file] = imgInput.files;
                if (file) {
                    previewImg.src = URL.createObjectURL(file);
                    previewImg.style.display = 'block';
                } else {
                    previewImg.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>
