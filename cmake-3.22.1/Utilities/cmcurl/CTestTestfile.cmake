# CMake generated Testfile for 
# Source directory: /home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1/Utilities/cmcurl
# Build directory: /home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1/Utilities/cmcurl
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
add_test([=[curl]=] "curltest" "http://open.cdash.org/user.php")
set_tests_properties([=[curl]=] PROPERTIES  _BACKTRACE_TRIPLES "/home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1/Utilities/cmcurl/CMakeLists.txt;1506;add_test;/home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1/Utilities/cmcurl/CMakeLists.txt;0;")
subdirs("lib")
