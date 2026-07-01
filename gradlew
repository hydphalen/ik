#!/usr/bin/env bash

##############################################################################
##
##  Gradle start up script for UN*X
##
##############################################################################

# Attempt to set APP_HOME
# Resolve links: $0 may be a link
prg="$0"
# Need this for relative symlinks.
while [ -h "$prg" ] ; do
    ls -ld "$prg"
    link=`expr "$prg" : '.*->\(.*\)$'`
    if expr "$link" : '/.*' > /dev/null; then
        prg="$link"
    else
        prg=`dirname "$prg"`"/$link"
    fi
done
SAVE_PWD=`pwd`
cd "`dirname \"$prg\"`" >/dev/null
APP_HOME=`pwd -P`
cd "$SAVE_PWD" >/dev/null

CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar

# Determine the Java command to use to start the JVM.
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        # IBM's JDK on AIX uses strange locations for the executables
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
    if [ ! -x "$JAVACMD" ] ; then
        echo "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME" >&2
        exit 1
    fi
else
    JAVACMD="java"
fi

exec "$JAVACMD" -cp "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
