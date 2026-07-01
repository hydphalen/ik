#!/usr/bin/env sh

APP_HOME="$(cd "$(dirname "$0")" && pwd)"
APP_JAR="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"
JAVA_OPTS="-Xmx64m -Xms64m"

# Detect the Java command
if [ -n "$JAVA_HOME" ]; then
    JAVACMD="$JAVA_HOME/bin/java"
else
    JAVACMD="java"
fi

# Execute Gradle wrapper
"$JAVACMD" $JAVA_OPTS -classpath "$APP_JAR" org.gradle.wrapper.GradleWrapperMain "$@"
