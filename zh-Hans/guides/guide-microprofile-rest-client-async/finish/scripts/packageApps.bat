call mvn -Dhttp.keepAlive=false ^
         -Dmaven.wagon.http.pool=false ^
         -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 ^
         -pl models clean install
call mvn -Dhttp.keepAlive=false ^
         -Dmaven.wagon.http.pool=false ^
         -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 ^
         -q clean package
