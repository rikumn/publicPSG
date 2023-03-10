<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_quantity = $_POST['quantity'];
    
    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute(); 

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    
    if (count($result) > 0) 
    {
        echo 'existe!';
        if ( $_quantity == null) $_quantity = NULL;
        $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `ClientsAttended` = :quantity WHERE `WalletAddress` = :usuario');
        $sth->bindParam(':quantity', $_quantity, PDO::PARAM_INT);
        $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
        $sth->execute(); 
    }
    
    $dbh->commit();
    echo count($result);
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
