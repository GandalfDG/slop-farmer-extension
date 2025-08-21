extends Node2D

@export var rows: int = 5
@export var cols: int = 5

@export var offset: float = 55.0

var grid: Array[Array]
var groups: Array

var debug_label: Label

var token = preload("res://token.tscn")

func _ready():
	debug_label = $"Debug Label"
	
	for row in rows:
		grid.append([])
		for column in cols:
			var token_node = token.instantiate()
			add_child(token_node)
			token_node.position = Vector2(offset*column, offset*row)
			token_node.set_type(randi_range(0,3 ))
			token_node.set_debug_label(str(row) + "," + str(column))
			grid[row].append(token_node)
			
	
func _process(_delta: float) -> void:
	if Input.is_action_just_pressed("activate"):
		calculate_token_groups()
			
func populate_grid():
	pass
	
func to_grid_coord(idx):
	pass
	
func to_index(idx):
	pass
	
func calculate_token_groups():
	groups = []
	var visited_nodes = []
	var group_queue = []
	for row in rows:
		for col in cols:
			if [row, col] in visited_nodes:
				continue
				
			group_queue.append([row,col])
			
			var new_group = []
			while not group_queue.is_empty():
				var current_coord = group_queue.pop_back()
				var current_token = grid[current_coord[0]][current_coord[1]]
				new_group.append(current_coord)
				visited_nodes.append(current_coord)
			
				var adjacent_token_coords = [
					[current_coord[0] - 1, current_coord[1]],
					[current_coord[0], current_coord[1] + 1],
					[current_coord[0] + 1, current_coord[1]],
					[current_coord[0], current_coord[1] - 1]
				]
			
				var valid_coords = adjacent_token_coords.filter(
					func(coord_pair): 
						return (
							coord_pair[0] >= 0 and 
							coord_pair[0] < rows and 
							coord_pair[1] >= 0 and 
							coord_pair[1] < cols
						)
				)
			
				for coord in valid_coords:
					if coord not in visited_nodes and grid[coord[0]][coord[1]].type == current_token.type:
						group_queue.append(coord)
			groups.append(new_group)
			
	debug_label.text = str(groups)
