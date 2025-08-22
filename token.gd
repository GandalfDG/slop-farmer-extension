extends Node2D

signal token_clicked

enum token_type {TYPE_1, TYPE_2, TYPE_3, TYPE_4}

var type: token_type = token_type.TYPE_1

var color_polygon
var debug_label: Label

func _ready():
	color_polygon = $Color
	debug_label = $"Debug Label"
			
func set_type(type: token_type):
	self.type = type
	match self.type:
		token_type.TYPE_1:
			color_polygon.color = Color.RED
		token_type.TYPE_2:
			color_polygon.color = Color.GREEN
		token_type.TYPE_3:
			color_polygon.color = Color.BLUE
		token_type.TYPE_4:
			color_polygon.color = Color.YELLOW
			
func set_debug_label(text: String):
	debug_label.text = text


func _on_area_2d_input_event(viewport: Node, event: InputEvent, shape_idx: int) -> void:
#	emit event up to parent on click
	if Input.is_action_just_pressed("select"):
		token_clicked.emit()
