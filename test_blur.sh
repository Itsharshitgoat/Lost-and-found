sed -i "s/implementation 'androidx.appcompat:appcompat:1.6.1'/implementation 'androidx.appcompat:appcompat:1.6.1'\n    implementation 'jp.wasabeef:blurry:4.0.1'/g" app/build.gradle
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
./gradlew assembleDebug
