// Wrong cavity depth and outer height (12 mm instead of 20 mm).
difference() {
  cube([50, 30, 12]);
  translate([5, 5, 5]) cube([40, 20, 12]);
}
