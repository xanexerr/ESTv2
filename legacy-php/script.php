<!-- Core JS Dependencies -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/js/select2.min.js"></script>

<script>
    function updateItemsPerPage(select) {
        var selectedValue = select.value;
        window.location.href = window.location.pathname + '?itemsPerPage=' + selectedValue;
    }

    function addClassToElement(elementId) {
        var element = document.getElementById(elementId);
        if (element) {
            element.classList.add("active");
        }
    }
</script>

<?php if (!isset($_SESSION["user_id"])): ?>
    <div class="py-2 px-3 text-center" style="background-color: var(--ssp-accent-cream); border-top: 1px solid #E5E7C8;">
        <div class="container d-flex flex-wrap justify-content-center align-items-center gap-2 small">
            <span class="text-secondary"><i class="fa-solid fa-circle-info me-1" style="color: var(--ssp-primary);"></i> ยังไม่มีบัญชีผู้ใช้งานใช่หรือไม่?</span>
            <a href="https://forms.gle/MJ74K2imzm8DAvkp6" class="fw-semibold" style="color: var(--ssp-primary);" target="_blank">
                ลงทะเบียนใช้งานระบบ <i class="fa-solid fa-arrow-up-right-from-square ms-1" style="font-size: 0.75rem;"></i>
            </a>
            <span class="text-muted">|</span>
            <a href="about.php" class="fw-semibold text-secondary">ติดต่อทีมงานผู้พัฒนา</a>
        </div>
    </div>
<?php endif; ?>

<footer class="ssp-footer">
    <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-building-columns"></i>
            <span>&copy; วิทยาลัยเทคนิคหาดใหญ่ (Hat Yai Technical College) — แผนกเทคโนโลยีสารสนเทศ</span>
        </div>
        <div class="small opacity-75">
            ระบบรวบรวมสถานประกอบการสำหรับนักเรียน นักศึกษา ฝึกประสบการณ์วิชาชีพ
        </div>
    </div>
</footer>
