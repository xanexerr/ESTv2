<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include("header.php"); ?>
<body>
    <?php include("navbar.php"); ?>

    <main class="container my-5 flex-grow-1">
        <div class="text-center mb-5">
            <span class="badge rounded-pill px-3 py-1 mb-2" style="background: var(--ssp-primary-light); color: var(--ssp-primary);">
                <i class="fa-solid fa-code-branch me-1"></i> Development Team
            </span>
            <h1 class="h3 fw-bold mb-2">ทีมผู้พัฒนาและติดต่อแอดมิน</h1>
            <p class="text-secondary mb-0">คณะผู้จัดทำโครงการระบบรวบรวมสถานประกอบการ แผนกเทคโนโลยีสารสนเทศ วิทยาลัยเทคนิคหาดใหญ่</p>
        </div>

        <div class="row g-4 justify-content-center">
            <!-- Developer 1 -->
            <div class="col-lg-3 col-md-6">
                <div class="ssp-card ssp-card-hover h-100 overflow-hidden text-center">
                    <img src="img/xan.jpg" alt="นายณัฐภูมินทร์ กล่ำมาตย์"
                         style="width: 100%; aspect-ratio: 3.6/4; object-fit: cover;" />
                    <div class="p-3">
                        <h2 class="h5 fw-bold mb-1">นายณัฐภูมินทร์ กล่ำมาตย์</h2>
                        <p class="text-secondary small mb-3">ผู้พัฒนาระบบ / ผู้ดูแลระบบ</p>
                        <div class="d-flex justify-content-center gap-3">
                            <a class="btn btn-sm btn-outline-dark rounded-pill px-3" href="https://github.com/xanexerr" aria-label="github" target="_blank" rel="noopener">
                                <i class="fa-brands fa-github me-1"></i> GitHub
                            </a>
                            <a class="btn btn-sm btn-outline-primary rounded-pill px-3" href="https://www.facebook.com/natthapumin.klammat/" aria-label="facebook" target="_blank" rel="noopener">
                                <i class="fa-brands fa-facebook me-1"></i> Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Developer 2 -->
            <div class="col-lg-3 col-md-6">
                <div class="ssp-card ssp-card-hover h-100 overflow-hidden text-center">
                    <img src="img/handsome.jpg" alt="นายธีรภัทร แซ่ตั้ง"
                         style="width: 100%; aspect-ratio: 3.6/4; object-fit: cover;" />
                    <div class="p-3">
                        <h2 class="h5 fw-bold mb-1">นายธีรภัทร แซ่ตั้ง</h2>
                        <p class="text-secondary small mb-3">ผู้ร่วมพัฒนาระบบ</p>
                        <div class="d-flex justify-content-center gap-3">
                            <a class="btn btn-sm btn-outline-primary rounded-pill px-3" href="https://www.facebook.com/profile.php?id=100005825707675" aria-label="facebook" target="_blank" rel="noopener">
                                <i class="fa-brands fa-facebook me-1"></i> Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Developer 3 -->
            <div class="col-lg-3 col-md-6">
                <div class="ssp-card ssp-card-hover h-100 overflow-hidden text-center">
                    <img src="img/bast.jpg" alt="นายธนชาต นามเจริญ"
                         style="width: 100%; aspect-ratio: 3.6/4; object-fit: cover;" />
                    <div class="p-3">
                        <h2 class="h5 fw-bold mb-1">นายธนชาต นามเจริญ</h2>
                        <p class="text-secondary small mb-3">ผู้ร่วมพัฒนาระบบ</p>
                        <div class="d-flex justify-content-center gap-3">
                            <a class="btn btn-sm btn-outline-primary rounded-pill px-3" href="https://www.facebook.com/thanachart.namcharoen" aria-label="facebook" target="_blank" rel="noopener">
                                <i class="fa-brands fa-facebook me-1"></i> Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <?php include 'script.php'; ?>
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            addClassToElement("about");
        });
    </script>
</body>
</html>
