import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import Box from '@mui/material/Box';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Fab from '@mui/material/Fab';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import { useMutation, gql } from '@apollo/client';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Rings } from 'react-loader-spinner'

//GRAPHQL query template, this will be replaced by the variables
const CREATE_TODO = gql`
  mutation CreateTodo($title:String!, $description:String, $priority:Int!, $owner:String!,$tags:String, $status:String){
    createTodo(todo: {title: $title, description:$description, priority:$priority, owner:$owner, tags:$tags, status: $status }){
        id
        title
        description
        priority
        owner
        tags
        status
    }
  }
`;

//The TO-DO default if we dont have any
const defaultTodo = {
    title: "This Is Your First ToDo Card!",
    description: "Buy some food for my dog and change their water",
    tags: ["healt", "rutine"],
    priority: 1,
    id: "abcdefg12345"
}

const tagsOptions = [
    'health',
    'rutine',
    'market'
]

export default function TodoInputComponent(props: {
    setState: React.Dispatch<React.SetStateAction<any>>, address: string
}) {
    const [priority, setPriority] = React.useState("");
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [titleError, setTitleError] = React.useState(false);
    const [descriptionError, setDescriptionError] = React.useState(false);
    const [tag, setTag] = React.useState<string[]>([]);
    const priorities = [1, 2, 3, 4]

    const [createTodo, { data, loading, error }] = useMutation(CREATE_TODO);

    React.useEffect(() => {
        if (data) {
            props.setState(data.createTodo)
            clearInputs()
            setTitleError(false)
            setDescriptionError(false)
        }
    }, [data])



    if (error) return <h1>Submission error! {error.message}</h1>;


    const handleChangePriorities = (event: React.MouseEvent<HTMLElement>, priority: string) => {
        setPriority(priority);
    };

    function clearInputs() {
        setTitle("")
        setDescription("")
        setPriority("")
        setTitleError(false)
        setDescriptionError(false)
        setTag([])
    }

    const handleChangeTagsSelect = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value as string[];
        setTag(value);
    };

    const Loader = () => {
        if (loading) return (
            <Rings
                height="180"
                width="180"
                radius={2}
                color="#54d45b"
                ariaLabel="puff-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
        );
        else {
            return <></>
        }

    }

    return (
        <div className="list-container">
            <Loader />
            <Card key="input-card" sx={{ width: "500px", mb: 3, borderRadius: "11px", boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 0%), 0px 1px 1px 0px rgb(0 0 0 / 7%), 0px 1px 3px 0px rgb(0 0 0 / 3%)" }}>
                <CardContent sx={{ display: "flex", flexDirection: "column" }}>
                    <TextField
                        error={titleError}
                        id="title"
                        label="Title"
                        helperText={titleError ? "Some fields are required" : null}
                        placeholder={defaultTodo.title}
                        value={title}
                        onChange={(event) => {
                            setTitleError(false)
                            setTitle(event.target.value);
                        }}
                        sx={{ marginBottom: "1em", }}
                    />
                    <TextField
                        error={descriptionError}
                        sx={{ marginBottom: "1em" }}
                        id="description"
                        label="Description"
                        placeholder={defaultTodo.description}
                        helperText={descriptionError ? "Some fields are required" : null}
                        value={description}
                        onChange={(event) => {
                            setDescriptionError(false)
                            setDescription(event.target.value);
                        }}
                        multiline={true}
                        rows={3}
                        inputProps={{
                            style: {
                                height: "10em"
                            }
                        }}
                    />
                    <Box sx={{ display: "flex", flexDirection: "row", width: "800px" }}>
                        <ToggleButtonGroup
                            value={priority}
                            exclusive
                            defaultValue={1}
                            onChange={handleChangePriorities}
                            aria-label="text alignment"
                            sx={{ justifyContent: "space-between", width: "250px" }}
                        >
                            {priorities.map((priority) => {
                                return (
                                    <ToggleButton key={String(priority)} value={priority} sx={{ height: "50px", width: "50px", border: "1px solid #0000003b!important" }}>
                                        {priority}
                                    </ToggleButton>
                                )
                            })}
                        </ToggleButtonGroup>
                        <FormControl sx={{ width: 170, marginLeft: "50px" }}>
                            <InputLabel id="tags-label">Tags</InputLabel>
                            <Select
                                labelId="tags-label"
                                id="tags"
                                multiple
                                value={tag}
                                onChange={handleChangeTagsSelect}
                                input={<OutlinedInput label="Tags" />}
                            >
                                {tagsOptions.map((tag: string) => (
                                    <MenuItem
                                        key={tag}
                                        value={tag}
                                    >
                                        {tag}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", minWidth: "200px", marginBottom: "2em" }}>
                <Fab onClick={(e) => {
                    clearInputs()
                }} sx={{
                    backgroundColor: "#0000003d", "&:hover": {
                        backgroundColor: "#c54662"
                    }
                }} aria-label="add">
                    <ClearIcon />
                </Fab>
                <Fab onClick={(e) => {
                    if (title && description) {
                        createTodo({ variables: { title: title, description: description, priority: priority, owner: props.address, tags: tag, status: "ready" } })
                    } else {
                        setTitleError(true)
                        setDescriptionError(true)
                    }
                }} sx={{
                    backgroundColor: "#0000003d", "&:hover": {
                        backgroundColor: "#54d45b"
                    }
                }} aria-label="add">
                    <CheckIcon />
                </Fab>
            </Box>
        </div >
    );
}