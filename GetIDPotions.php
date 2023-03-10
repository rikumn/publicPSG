<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->beginTransaction();
    
    $_usuario = $_GET['usuario'];
    
   // $sth = $dbh->prepare('SELECT `ID` FROM `PotionSeller_db` WHERE `WalletAddress` = '.$_usuario);//POST
   $sth = $dbh->prepare('SELECT `ID` FROM `PotionSeller_db` WHERE `WalletAddress` = "'.$_usuario.'"');//GET
    $sth->execute();    
    
    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();

    if (count($result) > 0) 
    {
        $_ID = $result[0]['ID'];

        $sth = $dbh->prepare('SELECT `IDPociones` FROM `PocionesMagicPower` WHERE `IDUsuario` ='.$_ID.' and Estado=1');
        $sth->execute();
    
        $sth->setFetchMode(PDO::FETCH_ASSOC); 
        $result = $sth->fetchAll();
        if (count($result) > 0) 
        {
            for($i = 0; $i < count($result); ++$i)
            {
                echo $result[$i]['IDPociones'];
                if($i < count($result) - 1) { echo ","; }
            }
        }
        
    }
    else
    {
        echo 'Usuario sin Pociones ';
    }
    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>