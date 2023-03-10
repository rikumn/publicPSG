<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    
    $sth = $dbh->prepare('SELECT `Shops` FROM `ShopsToday` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute();
    
    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    $output = "";
    if (count($result) > 0) 
    {
        echo $result[0]['Shops'];
    }
    else
    {
        echo 'no se encontro el usuario!';
    }
    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
