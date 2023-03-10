<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_array = $_POST['array'];
    
    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute(); 

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    
    if (count($result) > 0 && $_array != null && $_array != "")
    {
        echo 'existe!';
        if ( $_array == null) $_array = NULL;
        $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `StoreList` = :array WHERE `WalletAddress` = :usuario');
        $sth->bindParam(':array', $_array, PDO::PARAM_STR);
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
