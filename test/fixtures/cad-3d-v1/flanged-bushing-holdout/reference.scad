$fn = 64;
difference() {
  union() {
    cylinder(h = 4, d = 24);
    cylinder(h = 16, d = 12);
  }
  translate([0, 0, -1]) cylinder(h = 18, d = 6);
}
