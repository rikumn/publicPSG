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
        if ( $_quantity == null)
        {
            $_quantity = NULL;
            $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `StoreVisited` = :StoreVisited WHERE `WalletAddress` = :usuario');
            $sth->bindParam(':StoreVisited', $_quantity, PDO::PARAM_INT);
            $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
            $sth->execute(); 
        }
        else
        {
            $StoreVisited_DB = $result[0]['StoreVisited'];
            
           if ($StoreVisited_DB != null) //if (is_int($StoreVisited_DB) === true) //numero
            {
                if ($_quantity == ($StoreVisited_DB - 1) && $_quantity >= 0)
                {
                    $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `StoreVisited` = :StoreVisited WHERE `WalletAddress` = :usuario');
                    $sth->bindParam(':StoreVisited', $_quantity, PDO::PARAM_INT);
                    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
                    $sth->execute();
                }
                else
                {
                    //numero diferente
                }
            }
            else //nulo
            {
                /* if ($_quantity == 3)
                {
                */
                    $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `StoreVisited` = :StoreVisited WHERE `WalletAddress` = :usuario');
                    $sth->bindParam(':StoreVisited', $_quantity, PDO::PARAM_INT);
                    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
                    $sth->execute();
                /* }
                else
                {
                    //no debe enviar nada que no sea un reinicio(3) porque esta null en la DB
                }*/
            }
        }
    }
    else
    {
        echo 'error';
    } 
    
    $dbh->commit();
    //echo count($result);
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
