//help text, update docker instructions if different regtest used
export const HELP_COMMANDS = {
  docker: '$ docker run -d --rm --name myapp -v -p 9899:9899 -p 9888:9888 -p 3889:3889 spacemanholdings/qtum-portal-dev',
  generateInitial: '$ docker exec myapp qcli generate 600'
  generateOne: '$ qcli generate 1'
};
