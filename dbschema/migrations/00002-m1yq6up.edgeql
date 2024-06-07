CREATE MIGRATION m1yq6upk5a7ypcgxc2wvzieo6ztsz2zdn7jok5w7ein2w6s6bvwn6a
    ONTO m1xfxfmegu5by46oylqnrrfkwnrsbtymz2y2okmikldz2utoqyn2ya
{
  ALTER TYPE default::Session {
      ALTER PROPERTY cart {
          RESET OPTIONALITY;
      };
  };
};
