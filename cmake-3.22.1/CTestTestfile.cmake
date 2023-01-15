# CMake generated Testfile for 
# Source directory: /home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1
# Build directory: /home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
include("/home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1/Tests/EnforceConfig.cmake")
add_test([=[SystemInformationNew]=] "/home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1/bin/cmake" "--system-information" "-G" "Unix Makefiles")
set_tests_properties([=[SystemInformationNew]=] PROPERTIES  _BACKTRACE_TRIPLES "/home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1/CMakeLists.txt;865;add_test;/home/den/HTMLCOIN_PROJECTS/hmix/cmake-3.22.1/CMakeLists.txt;0;")
subdirs("Source/kwsys")
subdirs("Utilities/std")
subdirs("Utilities/KWIML")
subdirs("Utilities/cmlibrhash")
subdirs("Utilities/cmzlib")
subdirs("Utilities/cmcurl")
subdirs("Utilities/cmnghttp2")
subdirs("Utilities/cmexpat")
subdirs("Utilities/cmbzip2")
subdirs("Utilities/cmzstd")
subdirs("Utilities/cmliblzma")
subdirs("Utilities/cmlibarchive")
subdirs("Utilities/cmjsoncpp")
subdirs("Utilities/cmlibuv")
subdirs("Source/CursesDialog/form")
subdirs("Source")
subdirs("Utilities")
subdirs("Tests")
subdirs("Auxiliary")
