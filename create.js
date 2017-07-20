var create = function create(canvas_div_id) {
  this.set_canvas(canvas_div_id);
}

create.prototype = new game();
create.prototype.constructor = create;

create.prototype.get_image = function() {

}

create.prototype.upload_ship = function() {

}
