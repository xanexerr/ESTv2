<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/select2.min.css" rel="stylesheet">
    <script src="../js/sweetalert10.16.0.js"></script>
</head>
<body>
    <?php
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        require_once '../connection.php';

        $wp_name     = trim($_POST['wp_name'] ?? '');
        $work_type   = trim($_POST['work_type'] ?? '');
        $description = trim($_POST['wp_des'] ?? '');
        $wp_address  = trim($_POST['wp_address'] ?? '');
        $work_tel    = trim($_POST['wp_tel'] ?? '');
        $map         = trim($_POST['map'] ?? '');

        $updatewp = "INSERT INTO workplaces (workplace_name, workplace_address, work_type, description, work_tel, user_id, rating, `show`, map)
                     VALUES (:wp_name, :wp_address, :work_type, :description, :work_tel, NULL, '0', 1, :map)";

        $stmt = $conn->prepare($updatewp);
        $stmt->bindParam(':wp_name', $wp_name);
        $stmt->bindParam(':wp_address', $wp_address);
        $stmt->bindParam(':work_type', $work_type);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':work_tel', $work_tel);
        $stmt->bindParam(':map', $map);

        if ($stmt->execute()) {
            echo '<script>
            Swal.fire({
                title: "เพิ่มสถานประกอบการสำเร็จ!",
                icon: "success",
                confirmButtonText: "ตกลง"
            }).then(() => {
                window.location.href = "../admin-wp.php";
            });
            </script>';
            exit();
        } else {
            echo "เกิดข้อผิดพลาด : " . e($stmt->errorInfo()[2] ?? '');
        }
    }
    ?>
</body>
</html>
