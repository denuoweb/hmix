cmake_minimum_required(VERSION 2.8.10)

set(CTEST_SOURCE_DIRECTORY "/home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1/Tests/VSProjectInSubdir")
set(CTEST_BINARY_DIRECTORY "/home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1/Tests/CTestBuildCommandProjectInSubdir/Nested")
set(CTEST_CMAKE_GENERATOR "Unix Makefiles")
set(CTEST_BUILD_CONFIGURATION "Release")

ctest_empty_binary_directory(${CTEST_BINARY_DIRECTORY})
ctest_start(Experimental)
ctest_configure(OPTIONS "-DCMAKE_MAKE_PROGRAM:FILEPATH=/usr/bin/gmake")
ctest_build(TARGET test)
