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
    require_once "../connection.php";

    $user_id      = $_SESSION['user_id'] ?? '';
    $workplace_id = isset($_POST['workplace_id']) ? (int)trim($_POST['workplace_id']) : 0;
    $comment_text = trim($_POST['comment'] ?? '');

    if (isset($_FILES['img']) && $_FILES['img']['error'] !== 4 && $_FILES['img']['error'] === UPLOAD_ERR_OK) {
        if (!empty($_POST['old_img'])) {
            $oldNorm = normalizeCommentImagePath($_POST['old_img']);
            if ($oldNorm !== null && file_exists('../' . $oldNorm)) {
                @unlink('../' . $oldNorm);
            }
        }

        $new_img    = $_FILES['img'];
        $ext        = strtolower(pathinfo($new_img['name'], PATHINFO_EXTENSION));
        $fileNew    = rand() . '.' . $ext;
        $targetPath = '../img/' . $fileNew;
        move_uploaded_file($new_img['tmp_name'], $targetPath);

        $stmt = $conn->prepare("UPDATE comments SET comment_text = :comment_text, img = :new_img WHERE user_id = :user_id");
        $stmt->bindParam(':comment_text', $comment_text);
        $stmt->bindParam(':new_img', $fileNew);
        $stmt->bindParam(':user_id', $user_id);
    } else {
        $stmt = $conn->prepare("UPDATE comments SET comment_text = :comment_text WHERE user_id = :user_id");
        $stmt->bindParam(':comment_text', $comment_text);
        $stmt->bindParam(':user_id', $user_id);
    }

    if ($stmt->execute()) {
        if ($workplace_id > 0) {
            recalculateWorkplaceRating($conn, $workplace_id);
        }
        echo "<script>
            Swal.fire('แสดงความคิดเห็นแล้ว!', 'ความคิดเห็นของคุณถูกบันทึกแล้ว', 'success').then(function() {
                window.location.href = '../wp-detail.php?id=$workplace_id';
            });
        </script>";
        exit();
    } else {
        echo "<script>
            Swal.fire('Error', 'มีข้อผิดพลาดในการแก้ไขข้อมูล', 'error').then(function() {
                window.location.href = '../index.php';
            });
        </script>";
    }
    ?>
</body>
</html>
