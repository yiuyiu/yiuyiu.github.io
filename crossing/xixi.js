function getRandomX(Initx, next) {
    var foundtrue = false;
    var tempInitX = 0;
    z = 0;
    zprev = 0;
    znext = 0;
    while (!foundtrue) {
      tempInitX = Math.floor(Math.random() * Math.pow(2, Dwidth * Dheight));
      zprev = countones(Initx);
      if (zprev == 0) zprev = 5;
      // if ((zprev < Dwidth*Dheight) && (nooftrials<=1))
      if (zprev < Dwidth * Dheight) znext = zprev + next;
      else znext = zprev;
      z = countones(tempInitX);
      // alert("Prevcount=" +zprev+" NewX="+tempInitX+"  countones="+z);
      if (z != znext) continue;

      foundtrue = S[tempInitX].result;
    }
    return tempInitX;
  }