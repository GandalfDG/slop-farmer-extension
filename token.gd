extends Node2D

enum token_type {TYPE_1, TYPE_2, TYPE_3, TYPE_4}

var type: token_type = token_type.TYPE_1

var color_polygon

func _ready():
	color_polygon = $Color
	type = randi_range(0, 3) as token_type
	match type:
		token_type.TYPE_1:
			color_polygon.color = Color.RED
		token_type.TYPE_2:
			color_polygon.color = Color.GREEN
		token_type.TYPE_3:
			color_polygon.color = Color.BLUE
		token_type.TYPE_4:
			color_polygon.color = Color.YELLOW
