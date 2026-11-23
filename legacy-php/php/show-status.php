<?php
require_once '../connection.php';

if (isset($_GET['id'])) {
    $workplace_id = (int)$_GET['id'];

    $stmt = $conn->prepare("SELECT `show` FROM workplaces WHERE workplace_id = :workplace_id");
    $stmt->bindParam(':workplace_id', $workplace_id, PDO::PARAM_INT);
    $stmt->execute();
    $workplaceData = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($workplaceData) {
        $status = ((int)$workplaceData['show'] === 1) ? 0 : 1;
        $updatestatus = "UPDATE workplaces SET `show` = :status WHERE workplace_id = :workplace_id";
        $stmt = $conn->prepare($updatestatus);
        $stmt->bindParam(':status', $status, PDO::PARAM_INT);
        $stmt->bindParam(':workplace_id', $workplace_id, PDO::PARAM_INT);
        if ($stmt->execute()) {
            echo "<script>window.location.href = '../admin-wp-edit.php?id=$workplace_id';</script>";
            exit();
        } else {
            echo "เกิดข้อผิดพลาด : " . e($stmt->errorInfo()[2] ?? '');
        }
    } else {
        echo "Workplace not found.";
    }
}

if (isset($_GET['comment_id'])) {
    $comment_id = (int)$_GET['comment_id'];

    $stmt = $conn->prepare("SELECT `show`, workplace_id FROM comments WHERE comment_id = :comment_id");
    $stmt->bindParam(':comment_id', $comment_id, PDO::PARAM_INT);
    $stmt->execute();
    $commentData = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($commentData) {
        $status = ((int)$commentData['show'] === 1) ? 0 : 1;
        $updatestatus = "UPDATE comments SET `show` = :status WHERE comment_id = :comment_id";
        $stmt = $conn->prepare($updatestatus);
        $stmt->bindParam(':status', $status, PDO::PARAM_INT);
        $stmt->bindParam(':comment_id', $comment_id, PDO::PARAM_INT);
        if ($stmt->execute()) {
            recalculateWorkplaceRating($conn, $commentData['workplace_id']);
            echo "<script>window.location.href = '../admin-comment.php';</script>";
            exit();
        } else {
            echo "เกิดข้อผิดพลาด : " . e($stmt->errorInfo()[2] ?? '');
        }
    } else {
        echo "comment not found....";
    }
}
?>
