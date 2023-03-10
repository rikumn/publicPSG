<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_data = $_POST['data'];
    
    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = '.$_usuario);   
    $sth->execute(); 

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    
    if (count($result) > 0) 
    {
        echo 'existe!';
        if ( $_data == null) $_data = NULL;
        $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `Data` = '.$_data.' WHERE WalletAddress = '. $_usuario);
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